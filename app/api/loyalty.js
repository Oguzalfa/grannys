import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { neon } from '@neondatabase/serverless'

const categories = ['waffle','bowl','box','kumpir']
const digest = value => createHash('sha256').update(value).digest()
const equal = (a,b) => timingSafeEqual(digest(a),digest(b))
const norm = value => String(value ?? '').trim().toUpperCase()
const cookie = (key,value,age) => key+'='+value+'; Path=/api/loyalty; HttpOnly; Secure; SameSite=Lax; Max-Age='+age
function statusError(message,status=400){return Object.assign(new Error(message),{publicStatus:status})}
function staffSignature(secret,exp){return createHmac('sha256',secret).update('staff-session:'+exp).digest('hex')}
function staffSession(secret,cookies){
 const [exp,sig]=String(cookies.granny_staff||'').split('.')
 return /^\d{13}$/.test(exp)&&Number(exp)>Date.now()&&equal(sig||'',staffSignature(secret,exp))
}
async function book(sql,owner) {
 const [card,visits,rewards,config]=await sql.transaction([
  sql`SELECT stamps FROM loyalty_cards WHERE owner_hash=${owner}`,
  sql`SELECT DISTINCT category FROM loyalty_receipts WHERE owner_hash=${owner} AND kind='visit'`,
  sql`SELECT code,amount FROM loyalty_rewards WHERE owner_hash=${owner} AND redeemed_on IS NULL ORDER BY earned_on`,
  sql`SELECT reward_lira AS amount FROM loyalty_settings WHERE id`
 ])
 return {total:card[0]?.stamps||0,categories:visits.map(row=>row.category),rewards,amount:config[0]?.amount||null}
}
const reasons={invalid:'Kod bulunamadı. Fişteki kodu kontrol et.',used:'Bu kod daha önce kullanılmış.',expired:'Bu fiş kodunun 48 saatlik süresi dolmuş.',category:'İkram yalnızca Waffle veya Bowl için kullanılabilir.',receipt:'Bu fiş zaten işlendi.'}
export default async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store')
 if(req.method!=='POST')return res.status(405).json({error:'POST gerekli.'})
 try {
  if(!String(req.headers['content-type']||'').startsWith('application/json'))throw statusError('Geçersiz istek.',415)
  const origin=req.headers.origin
  if(origin&&new URL(origin).host!==req.headers.host)throw statusError('Geçersiz kaynak.',403)
  const secret=process.env.GRANNYS_KASA_ANAHTARI
  if(!process.env.GRANNYS_LOYALTY_DB||!secret)throw statusError('Kart servisi şu anda açılamıyor.',503)
  const sql=neon(process.env.GRANNYS_LOYALTY_DB)
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{}
  const cookies=Object.fromEntries(String(req.headers.cookie||'').split(';').map(x=>x.trim().split('=')))
  const respond=data=>res.status(200).json(data)
  const action=body.action
  if(action==='login'){
   if(typeof body.key!=='string'||!equal(body.key,secret))throw statusError('Kasa anahtarı geçersiz.',401)
   const exp=String(Date.now()+8*3600000)
   res.setHeader('Set-Cookie',cookie('granny_staff',exp+'.'+staffSignature(secret,exp),28800))
   return respond({ok:true})
  }
  if(action==='logout'){res.setHeader('Set-Cookie',cookie('granny_staff','',0));return respond({ok:true})}
  if(action==='book'||action==='claim'){
   let token=cookies.granny_wallet||''
   if(!/^[a-f0-9]{64}$/.test(token)){
    if(action==='claim')throw statusError('Önce damga kartını bu tarayıcıda aç.',409)
    token=randomBytes(32).toString('hex')
   }
   res.setHeader('Set-Cookie',cookie('granny_wallet',token,34560000))
   const owner=digest(token).toString('hex')
   let result
   if(action==='claim'){
    const code=norm(body.code).replace(/[\s-]/g,'')
    if(!/^[0-9A-F]{16}$/.test(code))throw statusError('Fişteki 16 karakterli kodu gir.')
    const rows=await sql`SELECT granny_claim(${code},${owner}) AS result`
    result=rows[0].result
    if(reasons[result])throw statusError(reasons[result],409)
   }
   return respond({...await book(sql,owner),result})
  }
  if(!staffSession(secret,cookies))throw statusError('Kasa girişi gerekiyor.',401)
  if(action==='settings'){
   const amount=Number(body.amount)
   if(!Number.isInteger(amount)||amount<1||amount>10000)throw statusError('1–10.000 ₺ arasında tam tutar gir.')
   await sql`INSERT INTO loyalty_settings(id,reward_lira) VALUES(true,${amount}) ON CONFLICT(id) DO UPDATE SET reward_lira=EXCLUDED.reward_lira`
   return respond({amount})
  }
  if(action==='dashboard'){
   const [settings,stats]=await sql.transaction([
    sql`SELECT reward_lira AS amount FROM loyalty_settings WHERE id`,
    sql`WITH v AS (SELECT owner_hash,issued_at AS claimed_at,row_number() OVER(PARTITION BY owner_hash ORDER BY issued_at,id) AS n FROM loyalty_receipts WHERE owner_hash IS NOT NULL),
     c AS (SELECT owner_hash,min(claimed_at) AS first_visit,max(claimed_at) FILTER(WHERE n=2) AS second_visit FROM v GROUP BY owner_hash)
     SELECT count(*)::int AS customers,count(*) FILTER(WHERE second_visit<=first_visit+interval '30 days')::int AS returned FROM c`
   ]);return respond({amount:settings[0]?.amount||null,...stats[0]})
  }
  const code=norm(body.code).replace(/[\s-]/g,'')
  if(action==='gift'){
   const [gift]=await sql`SELECT amount FROM loyalty_rewards WHERE code=${code} AND redeemed_on IS NULL`
   if(!gift)throw statusError('Kullanılabilir ikram bulunamadı.',404)
   return respond(gift)
  }
  const ref=norm(body.receipt),category=body.category
  if(!/^[A-Z0-9][A-Z0-9._/-]{0,47}$/.test(ref)||!categories.includes(category))throw statusError('Bugünkü fiş numarasını ve ürün türünü kontrol et.')
  if(action==='issue'){
   const [row]=await sql`INSERT INTO loyalty_receipts(receipt_ref,category,kind,reward_lira)
    SELECT ${ref},${category},'visit',reward_lira FROM loyalty_settings WHERE id
    ON CONFLICT(business_day,receipt_ref) DO UPDATE SET receipt_ref=excluded.receipt_ref
    RETURNING code,category,kind,owner_hash IS NOT NULL AS claimed`
   if(!row)throw statusError('Önce şubenin ikram tutarını kaydet.',409)
   if(row.kind!=='visit'||row.category!==category||row.claimed)throw statusError('Bu fiş zaten işlendi.',409)
   return respond({code:row.code})
  }
  if(action==='redeem'){
   const [row]=await sql`SELECT granny_redeem(${code},${ref},${category}) AS result`
   if(reasons[row.result])throw statusError(reasons[row.result],409)
   return respond({ok:true})
  }
  throw statusError('İşlem bulunamadı.',404)
 }catch(error){return res.status(error.publicStatus||503).json({error:error.publicStatus?error.message:'Kart servisine ulaşılamadı. Tekrar dene.'})}
}
