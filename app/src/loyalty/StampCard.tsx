import {useCallback,useEffect,useRef,useState} from 'react'
import {QRCodeSVG} from 'qrcode.react'
import {categoryLabels,displayCode,pilot,type Book} from './pilot'

export function useStampBook(open:boolean){
 const [book,setBook]=useState<Book|null>(null),[error,setError]=useState('')
 const pending=useRef(false),version=useRef(0),mounted=useRef(false)
 const refresh=useCallback(async()=>{
  if(pending.current)return
  pending.current=true
  const requestVersion=version.current
  try{
   const latest=await pilot<Book>('book')
   if(mounted.current&&requestVersion===version.current){setBook(latest);setError('')}
  }catch(e){
   if(mounted.current&&requestVersion===version.current)setError((e as Error).message)
  }finally{pending.current=false}
 },[])
 useEffect(()=>{
  mounted.current=true
  void refresh()
  const onVisible=()=>{if(document.visibilityState==='visible')void refresh()}
  document.addEventListener('visibilitychange',onVisible)
  return ()=>{mounted.current=false;document.removeEventListener('visibilitychange',onVisible)}
 },[refresh])
 useEffect(()=>{if(open)void refresh()},[open,refresh])
 const accept=(latest:Book)=>{version.current+=1;setBook(latest);setError('')}
 return {book,error,refresh,accept}
}

export function StampCard({initialCode,wallet}:{initialCode:string;wallet:ReturnType<typeof useStampBook>}){
 const {book,error,refresh,accept}=wallet
 const [code,setCode]=useState(initialCode),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[shown,setShown]=useState('')
 async function claim(){
  setBusy(true);setMessage('')
  try{const b=await pilot<Book>('claim',{code});accept(b);setCode('');setMessage(b.result==='already'?'Bu damga zaten defterinde.':'Waffle damgan defterine işlendi.')}
  catch(e){setMessage((e as Error).message)}finally{setBusy(false)}
 }
 const count=book?(book.total%4):0
 return <section className="stamp-panel" aria-label="Müdavim kartı">
  <div className="stamp-paper"><div className="stamp-heading"><h3>Damgalarım</h3>{book&&<span>{count} / 4</span>}</div>
   <div className="stamp-row" aria-hidden="true">{[0,1,2,3].map(i=><span className={i<count?'stamped':''} key={i}>{i<count?<img src="/assets/waffle-stamp.webp" alt=""/>:i+1}</span>)}</div>
   <p>{!book?'Fişindeki damga kodunu bu karta ekleyebilirsin.':book.amount?('Dört damgada '+book.amount+' ₺ Waffle veya Bowl ikramı.'):'Kasa programı açtığında ilk fişinle damga toplayabilirsin.'}</p>
   {book&&book.rewards.length>0&&<strong>{book.rewards.length} kullanılabilir ikramın var.</strong>}
  </div>
  {book?.rewards.map(r=><div key={r.code} className="gift-slip"><button onClick={()=>setShown(shown===r.code?'':r.code)}>{r.amount} ₺ ikramı kasaya göster</button>{shown===r.code&&<div><QRCodeSVG value={location.origin+'/kasa#ikram='+r.code} size={132} marginSize={4}/><b>{displayCode(r.code)}</b><p>Yeni bir Waffle veya Bowl fişinde kasiyere göster.</p></div>}</div>)}
  {book&&<form className="stamp-claim" onSubmit={e=>{e.preventDefault();void claim()}}><label>Fişindeki damga kodu<input value={code} autoCapitalize="characters" spellCheck={false} maxLength={24} placeholder="XXXX XXXX XXXX XXXX" onChange={e=>setCode(e.target.value)}/></label><button disabled={busy||code.replace(/[\s-]/g,'').length!==16}>{busy?'Ekleniyor…':'Damgamı ekle'}</button></form>}
  {message&&<p role="status">{message}</p>}{error&&<div role="status"><p>{error}</p><button onClick={()=>void refresh()}>Yeniden dene</button></div>}
  {book&&book.categories.length>0&&<div className="flavour-pass"><h4>Lezzet pasaportum</h4>{Object.entries(categoryLabels).map(([id,label])=><span className={book.categories.includes(id)?'earned':''} key={id}>{book.categories.includes(id)?'✓ ':''}{label}</span>)}</div>}
  <small>Damga kodu 48 saat geçerli. Kartın bu tarayıcıda saklanır.</small>
 </section>
}
