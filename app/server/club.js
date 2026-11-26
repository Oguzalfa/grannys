import { createHash, createHmac, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import rules from './menu-rules.js'

const hash = value => createHash('sha256').update(value).digest()
const fail = (message, publicStatus = 400) => { throw Object.assign(new Error(message), { publicStatus }) }
const isId = id => typeof id === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)
const monthNow = async sql => (await sql`SELECT to_char(now() AT TIME ZONE 'Europe/Istanbul','YYYY-MM-01') AS month`)[0].month
export const customerActions = new Set(['backup','restore','ticket','openTicket','nominate','month','vote'])
export const staffActions = new Set(['candidates','publish','metrics'])

function cleanRecipe(input, privateCopy = false) {
 if (!input || !Object.hasOwn(rules,input.category) || !input.selections?.base?.length) fail('Tarifin tabanı eksik.')
 const steps = rules[input.category], selections = {}
 for (const [step, rule] of Object.entries(steps)) {
  const ids = input.selections[step] ?? []
  if (!Array.isArray(ids) || ids.length > (rule.limit ?? rule.ids.length) ||
      !ids.every(id => rule.ids.includes(id)) || new Set(ids).size !== ids.length) fail('Tarifte geçersiz malzeme seçimi var.')
  selections[step] = ids
 }
 const sauceWells = {}
 if (input.category === 'box') {
  const used = new Set()
  for (const id of selections.chocolate) {
   const pos = input.sauceWells?.[id]
   if ((pos === 0 || pos === 1) && !used.has(pos)) { sauceWells[id] = pos; used.add(pos) }
  }
  for (const id of selections.chocolate) if (!(id in sauceWells)) {
   const pos = used.has(0) ? 1 : 0
   sauceWells[id] = pos; used.add(pos)
  }
 }
 const recipe = { recipeName: String(input.recipeName || '').trim().slice(0,48), category: input.category, selections, sauceWells }
 if (privateCopy) return {...recipe, note: String(input.note || '').slice(0,250), qty: Math.min(20,Math.max(1,Math.floor(Number(input.qty) || 1)))}
 return recipe
}
function seal(token, code) {
 const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm',hash('granny-backup:'+code),iv)
 const data = Buffer.concat([cipher.update(token,'utf8'),cipher.final()])
 return Buffer.concat([iv,cipher.getAuthTag(),data]).toString('base64')
}
function unseal(envelope, code) {
 const raw = Buffer.from(envelope,'base64'), decipher = createDecipheriv('aes-256-gcm',hash('granny-backup:'+code),raw.subarray(0,12))
 decipher.setAuthTag(raw.subarray(12,28))
 return Buffer.concat([decipher.update(raw.subarray(28)),decipher.final()]).toString('utf8')
}

async function lineup(sql, month, owner) {
 const picks = await sql`SELECT p.ticket_id AS id,t.recipe,count(v.viewer_hash)::int AS votes,
  coalesce(bool_or(v.viewer_hash=${owner}),false) AS chosen
  FROM granny_month_picks p JOIN granny_tickets t ON t.id=p.ticket_id
  LEFT JOIN granny_month_votes v ON v.month=p.month AND v.ticket_id=p.ticket_id
  WHERE p.month=${month}::date GROUP BY p.slot,p.ticket_id,t.id ORDER BY p.slot`
 return {month, picks}
}
export async function customerClub({sql,body,token,owner,book,installWallet}) {
 const {action} = body
 if (action === 'backup') {
  if (!Array.isArray(body.recipes) || body.recipes.length > 50) fail('En fazla 50 tarif yedeklenebilir.')
  const recipes = body.recipes.map(r=>cleanRecipe(r,true))
  const code = createHmac('sha256',token).update('grannys-private-recovery-v1').digest('hex').slice(0,32).toUpperCase()
  await sql`INSERT INTO granny_backups(owner_hash,key_hash,envelope,recipes)
   VALUES(${owner},${hash(code).toString('hex')},${seal(token,code)},${JSON.stringify(recipes)}::jsonb)
   ON CONFLICT(owner_hash) DO UPDATE SET recipes=EXCLUDED.recipes,updated_at=now()`
  return {code}
 }
 if (action === 'restore') {
  const code = String(body.code || '').toUpperCase().replace(/[\s-]/g,'')
  if (!/^[0-9A-F]{32}$/.test(code)) fail('32 karakterli yedek kodunu gir.')
  const [row] = await sql`SELECT owner_hash,envelope,recipes FROM granny_backups WHERE key_hash=${hash(code).toString('hex')}`
  if (!row) fail('Bu kodla kayıtlı bir kart bulunamadı.',404)
  const original = unseal(row.envelope,code)
  if (hash(original).toString('hex') !== row.owner_hash) fail('Yedek doğrulanamadı.',409)
  const restored = await book(sql,row.owner_hash)
  installWallet(original)
  return {book:restored,recipes:row.recipes}
 }
 if (action === 'ticket') {
  const recipe = cleanRecipe(body.recipe), json = JSON.stringify(recipe)
  const [row] = await sql`INSERT INTO granny_tickets(owner_hash,fingerprint,recipe)
   VALUES(${owner},${hash(json).toString('hex')},${json}::jsonb)
   ON CONFLICT(owner_hash,fingerprint) DO UPDATE SET fingerprint=EXCLUDED.fingerprint RETURNING id`
  return row
 }
 if (action !== 'month' && !isId(body.id)) fail('Bilet numarası geçersiz.')
 if (action === 'openTicket') {
  const [ticket] = await sql`SELECT id,recipe,owner_hash=${owner} AS mine FROM granny_tickets WHERE id=${body.id}::uuid`
  if (!ticket) fail('Pembe Bilet bulunamadı.',404)
  if (!ticket.mine) await sql`INSERT INTO granny_ticket_opens(ticket_id,viewer_hash) VALUES(${ticket.id},${owner}) ON CONFLICT DO NOTHING`
  return ticket
 }
 const month = await monthNow(sql)
 if (action === 'month') return lineup(sql,month,owner)
 if (action === 'nominate') {
  const [own] = await sql`SELECT id FROM granny_tickets WHERE id=${body.id}::uuid AND owner_hash=${owner}`
  if (!own) fail('Sadece kendi tarifini aday gösterebilirsin.',403)
  await sql`INSERT INTO granny_month_entries(month,ticket_id) VALUES(${month}::date,${own.id}) ON CONFLICT DO NOTHING`
  return {month}
 }
 if (body.month !== month) fail('Oylama ayı değişti. Seçkiyi yeniden aç.',409)
 const voted = await sql`INSERT INTO granny_month_votes(month,viewer_hash,ticket_id)
  SELECT month,${owner},ticket_id FROM granny_month_picks WHERE month=${month}::date AND ticket_id=${body.id}::uuid
  ON CONFLICT(month,viewer_hash) DO UPDATE SET ticket_id=EXCLUDED.ticket_id RETURNING ticket_id`
 if (!voted.length) fail('Bu tarif güncel seçkide yer almıyor.',409)
 return lineup(sql,month,owner)
}

export async function staffClub(sql,body) {
 const current = await monthNow(sql)
 if (body.action === 'metrics') {
  const period = body.period || current.slice(0,7)
  if (typeof period !== 'string' || !/^20\d{2}-(0[1-9]|1[012])$/.test(period)) fail('Geçerli bir ay seç.')
  const [row] = await sql`WITH bounds AS (SELECT ${period+'-01'}::date AS a,(${period+'-01'}::date+interval '1 month')::date AS b),
   days AS (SELECT owner_hash,business_day,min(issued_at) AS stamp FROM loyalty_receipts WHERE owner_hash IS NOT NULL AND kind='visit' GROUP BY owner_hash,business_day),
   visits AS (SELECT *,row_number() OVER(PARTITION BY owner_hash ORDER BY business_day) AS n FROM days),
   customers AS (SELECT owner_hash,min(business_day) AS first,max(business_day) FILTER(WHERE n=2) AS second FROM visits GROUP BY owner_hash),
   gifts AS (SELECT r.redeemed_on FROM loyalty_rewards r JOIN loyalty_receipts e ON e.id=r.earned_on,bounds WHERE (e.claimed_at AT TIME ZONE 'Europe/Istanbul')::date>=a AND (e.claimed_at AT TIME ZONE 'Europe/Istanbul')::date<b),
   tickets AS (SELECT id FROM granny_tickets,bounds WHERE (created_at AT TIME ZONE 'Europe/Istanbul')::date>=a AND (created_at AT TIME ZONE 'Europe/Istanbul')::date<b)
   SELECT count(*)::int AS customers,count(*) FILTER(WHERE second<=first+30)::int AS returned,
   (SELECT count(*)::int FROM gifts) AS earned,(SELECT count(redeemed_on)::int FROM gifts) AS redeemed,
   (SELECT count(*)::int FROM tickets) AS tickets,
   (SELECT count(*)::int FROM tickets t WHERE EXISTS(SELECT 1 FROM granny_ticket_opens o WHERE o.ticket_id=t.id)) AS opened
   FROM customers,bounds WHERE first>=a AND first<b`
  return {period,...row}
 }
 if (body.action === 'candidates') {
  const entries = await sql`SELECT t.id,t.recipe FROM granny_month_entries e JOIN granny_tickets t ON t.id=e.ticket_id
   WHERE e.month=${current}::date ORDER BY e.entered_at,t.id`
  return {...await lineup(sql,current,''), entries}
 }
 const ids = body.ids
 if (body.month !== current || !Array.isArray(ids) || ids.length !== 3 || new Set(ids).size !== 3 || !ids.every(isId)) fail('Bu ayın adaylarından üç farklı tarif seç.')
 // One statement publishes all three slots or none. Conflicting concurrent publications use the existing slate.
 const rows = await sql`WITH desired AS (SELECT value::uuid AS id,ordinality AS slot FROM jsonb_array_elements_text(${JSON.stringify(ids)}::jsonb) WITH ORDINALITY),
  eligible AS (SELECT d.* FROM desired d JOIN granny_month_entries e ON e.ticket_id=d.id AND e.month=${current}::date)
  INSERT INTO granny_month_picks(month,slot,ticket_id) SELECT ${current}::date,slot,id FROM eligible
  WHERE (SELECT count(*) FROM eligible)=3 ORDER BY slot ON CONFLICT DO NOTHING RETURNING slot`
 const result = await lineup(sql,current,'')
 if (rows.length !== 3 && !result.picks.every((p,i)=>p.id===ids[i])) fail('Bu ayın seçkisi zaten yayımlandı.',409)
 if (result.picks.length !== 3) fail('Seçilen üç tarif bu ayın adayları arasında olmalı.',409)
 return result
}
