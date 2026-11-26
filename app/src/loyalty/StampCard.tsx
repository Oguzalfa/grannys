import {useEffect,useState} from 'react'
import {QRCodeSVG} from 'qrcode.react'
import {categoryLabels,displayCode,pilot,type Book} from './pilot'

export function StampCard({initialCode}:{initialCode:string}){
 const [book,setBook]=useState<Book|null>(null),[code,setCode]=useState(initialCode),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[shown,setShown]=useState('')
 const [attempt,setAttempt]=useState(0)
 useEffect(()=>{
  let active=true
  pilot<Book>('book').then(b=>{if(active)setBook(b)}).catch(e=>{if(active)setMessage(e.message)})
  return ()=>{active=false}
 },[attempt])
 async function claim(){
  setBusy(true);setMessage('')
  try{const b=await pilot<Book>('claim',{code});setBook(b);setCode('');setMessage(b.result==='already'?'Bu damga zaten defterinde.':'Waffle damgan defterine işlendi.')}
  catch(e){setMessage((e as Error).message)}finally{setBusy(false)}
 }
 const count=book?(book.total%4):0
 return <section className="stamp-panel" aria-label="Müdavim kartı">
  <div className="stamp-paper"><div className="stamp-heading"><h3>Müdavim kartım</h3>{book&&<span>{count} / 4</span>}</div>
   <div className="stamp-row" aria-hidden="true">{[0,1,2,3].map(i=><span className={i<count?'stamped':''} key={i}>{i<count?<img src="/assets/waffle-stamp.webp" alt=""/>:i+1}</span>)}</div>
   <p>{!book?'Kart bilgileri':book.amount?('Dört damgada '+book.amount+' ₺ Waffle veya Bowl ikramı.'):'Kasa programı açtığında ilk fişinle damga toplayabilirsin.'}</p>
   {book&&book.rewards.length>0&&<strong>{book.rewards.length} kullanılabilir ikramın var.</strong>}
  </div>
  {book?.rewards.map(r=><div key={r.code} className="gift-slip"><button onClick={()=>setShown(shown===r.code?'':r.code)}>{r.amount} ₺ ikramı kasaya göster</button>{shown===r.code&&<div><QRCodeSVG value={location.origin+'/kasa#ikram='+r.code} size={132} marginSize={4}/><b>{displayCode(r.code)}</b><p>Yeni bir Waffle veya Bowl fişinde kasiyere göster.</p></div>}</div>)}
  {book&&<form className="stamp-claim" onSubmit={e=>{e.preventDefault();void claim()}}><label>Fişindeki damga kodu<input value={code} autoCapitalize="characters" spellCheck={false} maxLength={24} placeholder="XXXX XXXX XXXX XXXX" onChange={e=>setCode(e.target.value)}/></label><button disabled={busy||code.replace(/[\s-]/g,'').length!==16}>{busy?'Ekleniyor…':'Damgamı ekle'}</button></form>}
  {message&&<p role="status">{message}</p>}{!book&&message&&<button onClick={()=>{setMessage('');setAttempt(n=>n+1)}}>Yeniden dene</button>}
  {book&&book.categories.length>0&&<div className="flavour-pass"><h4>Lezzet pasaportum</h4>{Object.entries(categoryLabels).map(([id,label])=><span className={book.categories.includes(id)?'earned':''} key={id}>{book.categories.includes(id)?'✓ ':''}{label}</span>)}</div>}
  <small>Damga kodu 48 saat geçerli. Kartın bu tarayıcıda saklanır.</small>
 </section>
}
