import {useEffect,useState} from 'react'
import {FoodPreview} from '@/components/food-preview'
import {products,summarize} from '@/lib/grannys-menu'
import type {Recipe} from '../grannys-app'
import {categoryLabels,displayCode,pilot,type Book} from './pilot'

export type Ticket = {id:string;recipe:Recipe;mine?:boolean;votes:number;chosen:boolean}
export type Round = {month:string;picks:Ticket[]}
export const titleOf = (r:Recipe)=>r.recipeName || products.find(p=>p.id===r.category)!.title
export const monthLabel = (s:string)=>new Date(s.slice(0,7)+'-15T12:00:00Z').toLocaleDateString('tr-TR',{month:'long',year:'numeric',timeZone:'Europe/Istanbul'})
export const pack = (r:Recipe)=>({recipeName:r.recipeName,category:r.category,selections:r.selections,sauceWells:r.sauceWells})
const urlFor = (id:string)=>location.origin+'/#bilet='+encodeURIComponent(id)

export function Backup({recipes,book,onRestore}:{recipes:Recipe[];book:Book;onRestore:(b:Book,r:unknown)=>void}){
 const [mode,setMode]=useState(''),[code,setCode]=useState(''),[saved,setSaved]=useState(''),[ok,setOk]=useState(false)
 const [busy,setBusy]=useState(false),[msg,setMsg]=useState('')
 async function submit(){
  setBusy(true);setMsg('')
  try{
   if(mode==='restore'){
    const r=await pilot<{book:Book;recipes:unknown}>('restore',{code})
    onRestore(r.book,r.recipes);setCode('');setSaved('');setMode('');setMsg('Kartın ve yedeklediğin tarifler bu telefonda açıldı.')
   }else{
    const r=await pilot<{code:string}>('backup',{recipes:recipes.map(v=>({...pack(v),qty:v.qty,note:v.note}))})
    setSaved(displayCode(r.code));setMsg('Yedek güncellendi. Bu özel kodu güvenli bir yere kaydet.')
   }
  }catch(e){setMsg((e as Error).message)}finally{setBusy(false)}
 }
 return <details className="club-fold"><summary>Kartımı başka telefonda aç</summary><p>Damgaların, ikramların ve tarif defterin aynı özel kodla taşınır. Yeni tarifler eklediğinde yedeği güncelle.</p>
  <div className="club-actions"><button disabled={busy} onClick={()=>{setMode('backup');setMsg('');setSaved('')}}>Yedekle</button><button disabled={busy} onClick={()=>{setMode('restore');setMsg('');setOk(false);setSaved('')}}>Yedeği aç</button></div>
  {mode==='backup'&&<><p>{recipes.length} kayıtlı tarif yedeklenecek. Kodunu bilen kişi kartını ve ikramlarını açabilir.</p><button disabled={busy} onClick={submit}>Yedeğimi kaydet</button></>}
  {saved&&<label>Özel yedek kodun<input readOnly value={saved} onFocus={e=>e.target.select()}/></label>}
  {mode==='restore'&&<form onSubmit={e=>{e.preventDefault();void submit()}}><label>Özel yedek kodu<input value={code} autoComplete="off" spellCheck={false} maxLength={44} onChange={e=>setCode(e.target.value)}/></label>
   {book.total>0&&<label className="club-check"><input type="checkbox" checked={ok} onChange={e=>setOk(e.target.checked)}/>Bu telefondaki mevcut kartın yerine yedekteki kartı aç. Mevcut kartıma dönmek için yedek kodunu sakladım.</label>}
   <button disabled={busy||code.replace(/[\s-]/g,'').length!==32||(book.total>0&&!ok)}>Kartımı geri getir</button></form>}
  {msg&&<p role="status">{msg}</p>}
 </details>
}

export function TicketView({id,draft,onPrepare}:{id:string;draft:Recipe|null;onPrepare:(r:Recipe)=>void}){
 const [ticket,setTicket]=useState<Ticket|null>(null),[error,setError]=useState(''),[feedback,setFeedback]=useState(''),[attempt,retry]=useState(0),[nominated,setNominated]=useState(false),[busy,setBusy]=useState(false)
 useEffect(()=>{let active=true
  async function load(){
   setError('');setTicket(null)
   const target=id || (draft && (await pilot<{id:string}>('ticket',{recipe:pack(draft)})).id)
   if(!target)throw new Error('Tarif bulunamadı.')
   const t=await pilot<Ticket>('openTicket',{id:target})
   if(active)setTicket(t)
  }
  void load().catch(e=>{if(active)setError(e.message)})
  return()=>{active=false}
 },[id,draft,attempt])
 if(error)return <div className="club-sheet"><p role="status">{error}</p><button onClick={()=>retry(n=>n+1)}>Yeniden dene</button></div>
 if(!ticket)return <p role="status">Bilet açılıyor…</p>
 const r=ticket.recipe, url=urlFor(ticket.id)
 async function nominate(){setBusy(true);try{await pilot('nominate',{id:ticket!.id});setNominated(true);setFeedback('Tarifin bu ay şubenin değerlendireceği adaylara eklendi.')}catch(e){setFeedback((e as Error).message)}finally{setBusy(false)}}
 return <section className="club-sheet"><article className="pink-ticket">
  <div className="ticket-head"><img src="/assets/waffle-stamp.webp" alt=""/><span>GRANNY’S WAFFLES</span></div>
  <h3>{titleOf(r)}</h3><div className="ticket-plate"><FoodPreview category={r.category} selections={r.selections} sauceWells={r.sauceWells}/></div>
  <p>{summarize(r.category,r.selections).join(' · ')}</p></article>
  <button className="club-primary" onClick={()=>onPrepare(r)}>Bu tarifi hazırla</button>
  <div className="club-actions"><a href={'https://wa.me/?text='+encodeURIComponent(titleOf(r)+' · Granny’s Pembe Bilet\n'+url)} target="_blank" rel="noopener noreferrer">WhatsApp’ta paylaş</a>
  <button onClick={async()=>{try{await navigator.clipboard.writeText(url);setFeedback('Bilet bağlantısı kopyalandı.')}catch{setFeedback('Aşağıdaki bağlantıyı seçip kopyalayabilirsin.')}}}>Bağlantıyı kopyala</button></div>
  <label>Bilet bağlantısı<input value={url} readOnly onFocus={e=>e.target.select()}/></label>
  {ticket.mine&&<details className="club-fold"><summary>Ayın Tarifine katıl</summary><p>Şube tarifini seçerse adı ve malzemeleri bu ay menüde oylamaya açılır.</p><button disabled={busy||nominated} onClick={nominate}>{nominated?'Aday gösterildi':'Tarifimi aday göster'}</button></details>}
  {feedback&&<p role="status">{feedback}</p>}
 </section>
}

export function Monthly({onOpen,onStart}:{onOpen:(id:string)=>void;onStart:()=>void}){
 const [round,setRound]=useState<Round|null>(null),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false),[attempt,retry]=useState(0)
 useEffect(()=>{let active=true;setMsg('');void pilot<Round>('month').then(r=>{if(active)setRound(r)}).catch(e=>{if(active)setMsg(e.message)});return()=>{active=false}},[attempt])
 async function vote(id:string){setBusy(true);try{setRound(await pilot<Round>('vote',{id,month:round?.month}));setMsg('Oyun kaydedildi. Bu ay seçimini değiştirebilirsin.')}catch(e){setMsg((e as Error).message)}finally{setBusy(false)}}
 return <section className="club-sheet">{round?<><p className="club-month">{monthLabel(round.month)}</p>{round.picks.length?<><p>Şubenin seçtiği üç müşteri tarifini keşfet. Favorine oy ver.</p>{round.picks.map(t=><article className="club-candidate" key={t.id}><div><small>{categoryLabels[t.recipe.category]}</small><h3>{titleOf(t.recipe)}</h3><p>{summarize(t.recipe.category,t.recipe.selections).join(' · ')}</p></div><div className="club-actions"><button onClick={()=>onOpen(t.id)}>Tabağı gör</button><button disabled={busy||t.chosen} aria-pressed={t.chosen} onClick={()=>vote(t.id)}>{t.chosen?'Oyum burada':'Oy ver'} · {t.votes}</button></div></article>)}</>:<><h3>Bu ayın adayları toplanıyor.</h3><p>Kendi tabağını hazırla, Pembe Bilet oluştur ve tarifini aday göster. Şubenin seçtiği üç tarif burada oylamaya açılacak.</p><button className="club-primary" onClick={onStart}>Kendin Yap’a dön</button></>}</>:!msg&&<p>Seçki açılıyor…</p>}
 {msg&&<p role="status">{msg}</p>}{!round&&msg&&<button onClick={()=>retry(n=>n+1)}>Yeniden dene</button>}</section>
}
