import {useEffect,useState} from 'react'
import {pilot,categoryLabels} from './pilot'
import {summarize} from '@/lib/grannys-menu'
import {monthLabel,titleOf,type Ticket,type Round} from './Club'
type Candidates = Round & {entries:Ticket[]}
type Stats = {period:string;customers:number;returned:number;earned:number;redeemed:number;tickets:number;opened:number}
function rate(a:number,b:number){return b?new Intl.NumberFormat('tr-TR',{style:'percent',maximumFractionDigits:1}).format(a/b):'—'}
export function ClubDesk({mode}:{mode:string}){
 const [list,setList]=useState<Candidates|null>(null),[stats,setStats]=useState<Stats|null>(null),[ids,setIds]=useState<string[]>([]),[period,setPeriod]=useState(''),[busy,setBusy]=useState(false),[msg,setMsg]=useState(''),[attempt,retry]=useState(0)
 useEffect(()=>{let active=true;setMsg('');setList(null);setStats(null);setIds([])
  const task=mode==='metrics'?pilot<Stats>('metrics',{period}).then(v=>{if(active)setStats(v)}):pilot<Candidates>('candidates').then(v=>{if(active)setList(v)})
  void task.catch(e=>{if(active)setMsg(e.message)});return()=>{active=false}
 },[mode,period,attempt])
 async function publish(){
  if(!list)return
  setBusy(true)
  try{const r=await pilot<Round>('publish',{month:list.month,ids});setList({...list,...r});setMsg('Üç tarif menüde oylamaya açıldı.')}catch(e){setMsg((e as Error).message)}finally{setBusy(false)}
 }
 return <section className="club-sheet club-desk"><h2>{mode==='metrics'?'Müdavim göstergeleri':'Ayın Granny’s Tarifi'}</h2>
 {mode==='metrics'?<><label>İlk ziyaret, kazanım veya paylaşım ayı<input type="month" value={period||stats?.period||''} onChange={e=>setPeriod(e.target.value)}/></label>{stats&&<>
 {[[stats.returned,stats.customers,'30 günde ikinci ziyaret','İlk damgasını bu ay alan kartlardan farklı bir günde tekrar damga alanlar.'],
 [stats.redeemed,stats.earned,'Kullanılan ikramlar','Bu ay kazanılan ikramlardan bugüne kadar kullanılanlar.'],
 [stats.opened,stats.tickets,'Açılan Pembe Biletler','Bu ay oluşturulan biletlerden, sahibinden başka en az bir kartta açılanlar.']].map(([a,b,title,note])=><article className="club-candidate" key={String(title)}><h3>{title}</h3><strong>{rate(Number(a),Number(b))} · {a} / {b}</strong><p>{note}</p></article>)}
 <small>İlk ziyaretin üzerinden 30 gün geçene kadar geri dönüş oranı değişebilir.</small></>}</>:list&&<><p>{monthLabel(list.month)} · {list.entries.length} aday</p>
 {list.picks.length?<>{list.picks.map(t=><article key={t.id} className="club-candidate"><strong>{titleOf(t.recipe)}</strong><p>{t.votes} oy</p></article>)}</>:<>
 <p>Yayımlanacak üç tarifi seç. Oylama başladıktan sonra ayın seçkisi sabit kalır.</p>
 {list.entries.map(t=><label className="club-check club-candidate" key={t.id}><input type="checkbox" disabled={busy||(!ids.includes(t.id)&&ids.length===3)} checked={ids.includes(t.id)} onChange={()=>setIds(v=>v.includes(t.id)?v.filter(id=>id!==t.id):[...v,t.id])}/><span><strong>{titleOf(t.recipe)}</strong><small>{categoryLabels[t.recipe.category]} · {summarize(t.recipe.category,t.recipe.selections).join(' · ')}</small></span></label>)}
 <button className="club-primary" disabled={busy||ids.length!==3} onClick={publish}>Üç tarifi yayımla ({ids.length}/3)</button></>}</>}
 <button disabled={busy} onClick={()=>retry(n=>n+1)}>Yenile</button>{msg&&<p role="status">{msg}</p>}</section>
}
