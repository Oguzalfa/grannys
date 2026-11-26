import {useEffect,useState,type FormEvent} from 'react'
import {QRCodeSVG} from 'qrcode.react'
import {categoryLabels,displayCode,pilot} from './pilot'
import './loyalty.css'
import './club.css'
import {ClubDesk} from './ClubDesk'

type Dashboard={amount:number|null;customers:number;returned:number}
export default function Cashier(){
 const [state,setState]=useState<Dashboard|null>(null),[key,setKey]=useState(''),[value,setValue]=useState(''),[ref,setRef]=useState(''),[category,setCategory]=useState('waffle')
 const [claim,setClaim]=useState(''),[gift,setGift]=useState(()=>new URLSearchParams(location.hash.slice(1)).get('ikram')||''),[verified,setVerified]=useState<number|null>(null)
 const [mode,setMode]=useState(location.hash.startsWith('#ikram=')?'gift':'visit'),[busy,setBusy]=useState(false),[msg,setMsg]=useState('')
 async function refresh(){const d=await pilot<Dashboard>('dashboard');setState(d);setValue(String(d.amount||''))}
 useEffect(()=>{void refresh().catch(e=>{if(e.message!=='Kasa girişi gerekiyor.')setMsg(e.message)});history.replaceState(null,'',location.pathname)},[])
 async function run(e:FormEvent,op:()=>Promise<void>){e.preventDefault();if(busy)return;setBusy(true);setMsg('');try{await op()}catch(err){const m=(err as Error).message;setMsg(m);if(m==='Kasa girişi gerekiyor.')setState(null)}finally{setBusy(false)}}
 function switchMode(m:string){setMode(m);setClaim('');setVerified(null);setRef('');setMsg('');setCategory('waffle')}
 return <main className="cashier"><header><img src="/assets/logo.png" alt="Granny’s Waffles"/><h1>Granny’s Kasa</h1>{state&&<button onClick={e=>run(e,async()=>{await pilot('logout');setState(null);setClaim('');setVerified(null)})}>Çıkış</button>}</header>
 {!state?<form onSubmit={e=>run(e,async()=>{await pilot('login',{key});setKey('');await refresh()})}><label>Kasa anahtarı<input type="password" autoComplete="current-password" required value={key} onChange={e=>setKey(e.target.value)}/></label><button disabled={busy}>Kasayı aç</button></form>:<>
 <nav aria-label="Kasa işlemleri">{[['visit','Damga ver'],['gift','İkram kullan'],['monthly','Ayın tarifi'],['metrics','Göstergeler'],['settings','Pilot ayarları']].map(([m,t])=><button key={m} aria-pressed={mode===m} onClick={()=>switchMode(m)}>{t}</button>)}</nav>
 {mode==='monthly'||mode==='metrics'?<ClubDesk key={mode} mode={mode}/>:mode==='settings'?<form onSubmit={e=>run(e,async()=>{await pilot('settings',{amount:Number(value)});await refresh();setMsg('İkram tutarı kaydedildi.')})}><h2>İkram tutarı</h2><p>Dördüncü damgada geçerli olan tutar karta yazılır. Kazanılmış ikramlar kendi tutarını korur.</p><label>Waffle veya Bowl ikramı (₺)<input required type="number" min="1" max="10000" step="1" value={value} onChange={e=>setValue(e.target.value)}/></label><button disabled={busy}>Tutarı kaydet</button><p>{state.customers} damga kartı · İlk ziyaretinden sonraki 30 günde geri gelen {state.returned} kart.</p></form>:
 <form onSubmit={e=>run(e,async()=>{
  if(mode==='visit'){const r=await pilot<{code:string}>('issue',{receipt:ref,category});setClaim(r.code)}
  else if(verified===null){const r=await pilot<{amount:number}>('gift',{code:gift});setVerified(r.amount)}
  else {await pilot('redeem',{code:gift,category,receipt:ref});setMsg(verified+' ₺ ikram kullanıldı.');setVerified(null);setGift('');setRef('');await refresh()}
 })}><h2>{mode==='visit'?'Ödenmiş fişe damga':'İkramı doğrula'}</h2>
 {mode==='visit'&&!state.amount&&<p>İlk damgayı vermeden önce Pilot ayarları bölümünde ikram tutarını kaydet.</p>}
 {mode==='gift'&&<label>Müşterinin ikram kodu<input required value={gift} onChange={e=>{setGift(e.target.value);setVerified(null)}}/></label>}
 {(mode==='visit'||verified!==null)&&<><label>Bugünkü fiş numarası<input required value={ref} maxLength={48} placeholder="Örn. 001284" onChange={e=>{setRef(e.target.value);setClaim('')}}/></label><label>Ürün türü<select value={category} onChange={e=>{setCategory(e.target.value);setClaim('')}}>{Object.entries(categoryLabels).filter(([id])=>mode==='visit'||['waffle','bowl'].includes(id)).map(([id,t])=><option value={id} key={id}>{t}</option>)}</select></label></>}
 <button disabled={busy||(mode==='visit'&&!state.amount)}>{mode==='visit'?'Fiş QR’ı oluştur':verified===null?'İkramı kontrol et':verified+' ₺ ikramı bu fişte onayla'}</button></form>}
 {mode==='visit'&&claim&&<div className="issued"><QRCodeSVG value={location.origin+'/#damga='+claim} marginSize={4} size={180}/><b>{displayCode(claim)}</b><p>Müşteri bu QR’ı okutur veya kodu Tarif Defteri’ne girer.</p></div>}</>}
 {msg&&<p role="status">{msg}</p>}<a href="/">Menüye dön</a></main>
}
