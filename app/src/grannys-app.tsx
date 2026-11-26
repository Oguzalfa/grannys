import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, CaretRight, X, Plus, Minus, PencilSimple, Info, Handbag, Heart, SlidersHorizontal, Check, ForkKnife, MagnifyingGlass, ArrowsOutSimple, Play, Stamp, Medal, Ticket } from '@phosphor-icons/react'
import { ScrollScrub } from '@/components/scroll-scrub/scroll-scrub'
import { scrollScrubScenes, scrollScrubTheme } from '@/scroll-scrub-scenes'
import { FoodPreview, warmPreviewBases } from '@/components/food-preview'
import { matchesRecipePreview, completeRecipeThumbnails } from '@/lib/preview-state'
import { products, getSteps, getPrice, summarize, allMenu, catalogue, searchCatalogue, normalizeTurkish, type CatalogueItem, type Category, type Selection, type Option } from '@/lib/grannys-menu'
import { catalogueImages } from '@/lib/catalogue-images'
import { selectIngredient, assignSauceWells, type SauceWells } from '@/lib/recipe-selection'
import './grannys.css'
import './atelier.css'
import './loyalty/loyalty.css'
import './patisserie.css'
import './loyalty/club.css'
import { Backup, TicketView, Monthly, pack } from './loyalty/Club'
import { StampCard, useStampBook } from './loyalty/StampCard'

const categoryCaptions: Record<Category,string> = {
 waffle: 'İnce papatya veya kalın Brüksel.', bowl: 'Pembe kâsede, orta veya büyük boy.',
 box: 'Waffle, brownie ve iki ayrı sos gözü.', kumpir: 'Tereyağlı, kaşarlı fırın patates.',
}
export type Recipe={recipeName?:string;category:Category;selections:Selection;sauceWells:SauceWells;note:string;qty:number;thumb:string}
type BasketLine={id:string;category:Category;price:number;title:string;names:string[];qty:number;thumb:string;note:string}
type BasketItem=BasketLine & ((Recipe & {kind:'recipe'}) | {kind:'catalogue';productId:string})

function catalogueLine(item:CatalogueItem,qty=1):BasketItem {
 const photo=catalogueImages[item.id]
 return {kind:'catalogue',id:'catalogue-'+item.id,productId:item.id,category:item.category,
  price:item.price,title:item.portion?item.name+' · '+item.portion:item.name,names:item.coreIngredients,
  qty,thumb:photo?.cardImage||photo?.image||'',note:''}
}
function restoreBasket(value:unknown):BasketItem[] {
 if(!Array.isArray(value))return []
 const lines:BasketItem[]=[]
 for(const item of value){
  if(!item||typeof item!=='object')continue
  if(item.kind==='catalogue'){
   const product=catalogue.find(p=>p.id===item.productId)
   if(!product)continue
   const qty=Math.min(20,Math.max(1,Math.trunc(Number(item.qty)||1)))
   const prior=lines.find(row=>row.kind==='catalogue'&&row.productId===product.id)
   if(prior)prior.qty=Math.min(20,prior.qty+qty)
   else lines.push(catalogueLine(product,qty))
  }else if(!item.kind||item.kind==='recipe'){
   const [recipe]=restoreRecipes([item])
   if(recipe)lines.push({...recipe,kind:'recipe',id:'restored-'+lines.length,
    price:getPrice(recipe.category,recipe.selections),title:products.find(p=>p.id===recipe.category)!.title,
    names:summarize(recipe.category,recipe.selections)})
  }
 }
 return lines
}
const format=(n:number)=>new Intl.NumberFormat('tr-TR').format(n)+' ₺'
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v))
function Icon({name}:{name:string}){const Glyph=name==='heart'?Heart:name==='sliders'?SlidersHorizontal:name==='check'?Check:name==='waffle'?ForkKnife:Handbag;return <Glyph className="ui-icon" size={24} weight="regular" aria-hidden="true"/>}
function newRecipe(category:Category):Recipe{const p=products.find(x=>x.id===category)!;return {category,selections:{base:[p.options.find(x=>x.price===p.price)?.id||p.options[0]!.id]},sauceWells:{},note:'',qty:1,thumb:''}}
const validCategory=(v:unknown):v is Category=>products.some(p=>p.id===v)
function restoreRecipes(value:unknown):Recipe[]{if(!Array.isArray(value))return [];return value.filter(v=>v&&validCategory(v.category)&&v.selections&&typeof v.selections==='object'&&Array.isArray(v.selections.base)&&products.find(p=>p.id===v.category)!.options.some(o=>o.id===v.selections.base[0])).slice(0,50).map(v=>({recipeName:typeof v.recipeName==='string'?v.recipeName.slice(0,48):undefined,category:v.category,selections:Object.fromEntries(getSteps(v.category).map(step=>[step.id,Array.isArray(v.selections[step.id])?[...new Set<string>(v.selections[step.id].filter((id:unknown)=>typeof id==='string'&&step.options.some(o=>o.id===id)))].slice(0,step.limit??undefined):[]])),sauceWells:v.category==='box'?assignSauceWells(v.selections.chocolate,v.sauceWells):{},note:String(v.note||'').slice(0,250),qty:Math.min(20,Math.max(1,Number(v.qty)||1)),thumb:typeof v.thumb==='string'&&v.thumb.startsWith('data:image/')?v.thumb:''}))}
export default function Grannys(){
 const [intro,setIntro]=useState(false),[view,setView]=useState<'menu'|'builder'|'summary'>('menu'),[active,setActive]=useState<Category>('waffle'),[recipe,setRecipe]=useState<Recipe>(newRecipe('waffle')),[stepIndex,setStepIndex]=useState(0)
 const [basket,setBasket]=useState<BasketItem[]>([]),[favorites,setFavorites]=useState<Recipe[]>([]),[table,setTable]=useState(''),[tableDraft,setTableDraft]=useState(''),[modal,setModal]=useState<'basket'|'favorites'|'table'|'basket-table'|'menu'|'review'|'product'|'plate'|'name'|'ticket'|'month'|null>(null),[toast,setToast]=useState(''),[ready,setReady]=useState(false)
 const [ticketId,setTicketId]=useState(''),[ticketDraft,setTicketDraft]=useState<Recipe|null>(null)
 const readTicket=(id:string)=>{setTicketDraft(null);setTicketId(id);setIntro(false);setModal('ticket')}
 const shareRecipe=(r:Recipe)=>{setTicketDraft(clone(r));setTicketId('');setModal('ticket')}
 const wallet=useStampBook(modal==='favorites')
 const book=wallet.book
 const cardStatus=book?.rewards.length?book.rewards.length+' ikramın var':book?(book.total%4)+' / 4 damga':'Kartıma bak'
 const [walletPage,setWalletPage]=useState<'card'|'recipes'>('card')
 const openCard=()=>{setWalletPage('card');setModal('favorites')}
 const openNotebook=()=>{setWalletPage('recipes');setModal('favorites')}
 const [recipeName,setRecipeName]=useState(''),[receiptCode,setReceiptCode]=useState('')
 useEffect(()=>{
  const openReceipt=()=>{
   if(location.hash==='#kartim'){
    setIntro(false);setWalletPage('card');setModal('favorites')
    history.replaceState(null,'',location.pathname+location.search)
    return
   }
   const params=new URLSearchParams(location.hash.slice(1))
   const ticket=params.get('bilet')
   if(ticket){readTicket(ticket);history.replaceState(null,'',location.pathname+location.search);return}
   const code=params.get('damga')
   if(!code)return
   setReceiptCode(code.slice(0,24));setIntro(false);setWalletPage('card');setModal('favorites')
   history.replaceState(null,'',location.pathname+location.search)
  }
  openReceipt();window.addEventListener('hashchange',openReceipt)
  return ()=>window.removeEventListener('hashchange',openReceipt)
 },[])

 const [query,setQuery]=useState(''),[categoryFilter,setCategoryFilter]=useState<Category|'all'|'extras'>('all'),[detail,setDetail]=useState<CatalogueItem|null>(null)
 const visibleCatalogue=categoryFilter==='extras'?[]:searchCatalogue(query,categoryFilter)
 const searchTerm=normalizeTurkish(query)
 const showExtras=categoryFilter==='extras'||(categoryFilter==='all'&&searchTerm.length>0)
 const visibleExtras=showExtras?allMenu.Ekstralar!.filter(extra=>normalizeTurkish(extra.name).includes(searchTerm)):[]
 const resultCount=[
  visibleCatalogue.length>0&&visibleCatalogue.length+' ürün',
  visibleExtras.length>0&&visibleExtras.length+' ekstra',
 ].filter(Boolean).join(' · ')||'Sonuç yok'
 const [catalogueInView,setCatalogueInView]=useState(false)
 useEffect(()=>{
  const el=document.getElementById('hazir-urunler')
  if(!el||intro||view!=='menu'){setCatalogueInView(false);return}
  const update=()=>setCatalogueInView(el.getBoundingClientRect().top<=Math.min(window.innerHeight*.36,240))
  update(); window.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update)
  return ()=>{window.removeEventListener('scroll',update);window.removeEventListener('resize',update)}
 },[intro,view])
 const categoryName=(category:Category)=>products.find(p=>p.id===category)!.name
 const cardSrcSet=(id:string)=>{const p=catalogueImages[id];return p?.cardImage&&p.cardWidth&&p.imageWidth&&p.imageWidth>p.cardWidth?`${p.cardImage} ${p.cardWidth}w, ${p.image} ${p.imageWidth}w`:undefined}
 const diyPhotoId=(category:Category)=>({waffle:'granny-waffle',bowl:'waffle-bowl',box:'box-two',kumpir:'plain-kumpir'})[category]
 const openDetail=(item:CatalogueItem)=>{setDetail(item);setModal('product')}
 const dialogRef=useRef<HTMLDialogElement>(null),toastRef=useRef<ReturnType<typeof setTimeout>|null>(null)
 useEffect(()=>{warmPreviewBases();try{const data=JSON.parse(localStorage.getItem('grannys-menu-v2')||'{}');setBasket(restoreBasket(data.basket));setFavorites(restoreRecipes(data.favorites));const param=new URLSearchParams(location.search).get('masa');const n=param||String(data.table||'');setTable(/^\d{1,4}$/.test(n)?n:'');if(location.hash==='#menu')setIntro(false)}catch{}setReady(true);return()=>{if(toastRef.current)clearTimeout(toastRef.current)}},[])
 useEffect(()=>{if(!ready)return;try{localStorage.setItem('grannys-menu-v2',JSON.stringify({basket,favorites,table}))}catch{try{localStorage.setItem('grannys-menu-v2',JSON.stringify({basket:basket.map(x=>x.kind==='recipe'?{...x,thumb:''}:x),favorites:favorites.map(x=>({...x,thumb:''})),table}))}catch{setToast('Tarayıcı kayıt alanına erişilemiyor. Tarif bu oturumda kullanılabilir.')}}},[ready,basket,favorites,table])
 useEffect(()=>{if(modal&&!dialogRef.current?.open)dialogRef.current?.showModal();if(!modal&&dialogRef.current?.open)dialogRef.current.close();if(modal){dialogRef.current?.scrollTo(0,0);dialogRef.current?.querySelector('.modal-body')?.scrollTo(0,0)}},[modal])
 const product=products.find(p=>p.id===recipe.category)!,steps=getSteps(recipe.category),step=steps[stepIndex]||steps[0]!,total=basket.reduce((s,b)=>s+b.qty*b.price,0),count=basket.reduce((s,b)=>s+b.qty,0)
 const message=(s:string)=>{setToast(s);if(toastRef.current)clearTimeout(toastRef.current);toastRef.current=setTimeout(()=>setToast(''),3000)}
 const enter=()=>{setIntro(false);setView('menu');window.scrollTo({top:0,behavior:'instant'});history.replaceState(null,'',location.pathname+location.search+'#menu')}
 const start=(category:Category)=>{setActive(category);setIntro(false);setRecipe(newRecipe(category));setStepIndex(0);setView('builder');setModal(null);window.scrollTo({top:0,behavior:'instant'})}
 const startCatalogue=(item:CatalogueItem)=>{if(!item.configurable||!item.baseId||!products.find(p=>p.id===item.category)?.options.some(o=>o.id===item.baseId))return;start(item.category);setRecipe({...newRecipe(item.category),selections:{base:[item.baseId]}})}
 const backMenu=()=>{setIntro(false);setView('menu');setModal(null);window.scrollTo({top:0,behavior:'instant'})}
 const move=(n:number)=>{
  setStepIndex(n)
  setView('builder')
  if (window.matchMedia('(max-width: 899px)').matches) {
   requestAnimationFrame(()=>document.querySelector('.builder-layout')?.scrollIntoView({block:'start',behavior:'instant'}))
  }
 }
 const choose=(option:Option)=>{const list=recipe.selections[step.id]||[],ids=selectIngredient(step,list,option.id);if(ids===list){message('En fazla '+step.limit+' seçim yapabilirsin.');return}setRecipe(r=>({...r,thumb:'',selections:{...r.selections,[step.id]:ids},sauceWells:r.category==='box'&&step.id==='chocolate'?assignSauceWells(ids,r.sauceWells):r.sauceWells}))}
 const save=()=>{setRecipeName(recipe.recipeName||product.title);setModal('name')}
 const saveNamed=()=>{const name=recipeName.trim().slice(0,48);if(!name)return
  setFavorites(v=>[{...clone(recipe),recipeName:name},...v.filter(r=>r.recipeName!==name)].slice(0,30))
  setRecipe(r=>({...r,recipeName:name}));setModal(null);message('“'+name+'” tarif defterine kaydedildi.')}
 const openRecipe=(f:Recipe)=>{setActive(f.category);setRecipe(clone(f));setStepIndex(0);setView('builder');setModal(null);setIntro(false);window.scrollTo({top:0,behavior:'instant'})}
 const add=()=>{const item:BasketItem={...clone(recipe),kind:'recipe',id:crypto.randomUUID(),price:getPrice(recipe.category,recipe.selections),title:product.title,names:summarize(recipe.category,recipe.selections)};setBasket(v=>[...v,item]);message('Senin lezzetin sepete eklendi.');setModal('basket')}
 const addStandard=(product:CatalogueItem,openBasket=false)=>{
  const line=catalogueLine(product)
  const existing=basket.find(b=>b.id===line.id)
  if((existing?.qty??0)>=20){message('Bu üründen sepette 20 adet var.');return}
  setBasket(rows=>rows.some(b=>b.id===line.id)
   ?rows.map(b=>b.id===line.id?{...b,qty:Math.min(20,b.qty+1)}:b)
   :[...rows,line])
  if(openBasket)setModal('basket')
  else message(line.title+' sepete eklendi.')
 }
 const changeQuantity=(id:string,delta:number)=>setBasket(rows=>rows.map(row=>
  row.id===id?{...row,qty:Math.min(20,row.qty+delta)}:row).filter(row=>row.qty>0))
 const cardNav=<button className={'club-nav'+(modal==='favorites'?' active':'')} aria-haspopup="dialog" onClick={openCard}><Stamp className="ui-icon" aria-hidden="true"/><span>Kartım</span></button>
 const snapshot=(thumb:string,category:Category,selections:Selection,sauceWells?:SauceWells)=>{if(!thumb.startsWith('data:image/')||(category==='box'&&!sauceWells))return;setRecipe(r=>matchesRecipePreview(r,category,selections,sauceWells)&&r.thumb!==thumb?{...r,thumb}:r);setBasket(items=>completeRecipeThumbnails(items,thumb,category,selections,sauceWells));setFavorites(items=>completeRecipeThumbnails(items,thumb,category,selections,sauceWells))}
 const onSnapshot=useRef(snapshot);onSnapshot.current=snapshot
 const snapshotCallback=useRef((s:string,c:Category,v:Selection,w?:SauceWells)=>onSnapshot.current(s,c,v,w)).current
 const optionImage=(o:Option)=>{const override:Record<string,string>={oreo:'cookie','extra-cheese':'cheese','extra-butter':'cheese','milk-jam':'chocolate',magnolia:'cream'};if(['coconut','peanut','lotus','hazelnut','walnut','haribo','chestnut','brownie'].includes(o.id))return '/assets/ingredients/'+o.id+'.webp';if(override[o.id])return '/assets/ingredients/'+override[o.id]+'.webp';return o.image}
 const optionNames=(key:string)=>(recipe.selections[key]||[]).map(id=>steps.find(s=>s.id===key)?.options.find(o=>o.id===id)?.name).filter(Boolean).join(', ')||'Seçilmedi'
 const controls=<>{view==='builder'?<><div className="wizard-steps" aria-label="Hazırlama aşamaları">{steps.map((s,i)=><button key={s.id} className={i===stepIndex?'active':i<stepIndex?'done':''} onClick={()=>move(i)} aria-current={i===stepIndex?'step':undefined}><span>{i<stepIndex?'✓':i+1}</span>{s.label}</button>)}</div><div className="step-heading"><small>{stepIndex+1} / {steps.length}</small><h1>{step.title}</h1><p>{step.description}</p></div><div className="selected-count">{(recipe.selections[step.id]||[]).length}{step.limit!==null?' / '+step.limit:''} seçim</div><div className="ingredient-grid" data-step={step.id}>{step.options.map(o=>{const selected=(recipe.selections[step.id]||[]).includes(o.id);return <button className={'ingredient'+(selected?' selected':'')} key={o.id} onClick={()=>choose(o)} aria-pressed={selected}><span className="ingredient-photo">{step.id==='chocolate'?<span className={'sauce-swatch sauce-'+o.id}><img src="/assets/layers/chocolate.webp" alt=""/></span>:<img src={step.id==='base'&&catalogueImages[o.id]?(catalogueImages[o.id]!.cardImage||catalogueImages[o.id]!.image):optionImage(o)} alt="" loading="lazy"/>}</span><span className="ingredient-name">{o.name}</span><span className="ingredient-sub">{step.id==='base'?format(o.price||product.price):o.price?'+'+format(o.price):o.description}</span><span className="select-check" aria-hidden="true">{selected?<Icon name="check"/>:null}</span></button>})}</div><div className="price-dock"><div className="price-label"><small>Senin lezzetin</small><strong className="amount">{format(getPrice(recipe.category,recipe.selections))}</strong></div><div className="dock-actions">{stepIndex>0&&<button className="previous-button" onClick={()=>move(stepIndex-1)} aria-label="Önceki aşama"><ArrowLeft/></button>}<button className="next-button" onClick={()=>{if(stepIndex<steps.length-1)move(stepIndex+1);else{setView('summary');window.scrollTo({top:0,behavior:'instant'})}}}>{stepIndex===steps.length-1?'Tarifimi gör':'Devam et'}<CaretRight/></button></div></div></>:<><div className="step-heading"><small>SENİN TARİFİN</small><h1>Tam senlik.</h1><p>Son bir göz at. Dilersen seçimlerini düzenle.</p></div><button className="summary-save" onClick={save}>Tarif defterime kaydet</button><button className="club-share" onClick={()=>shareRecipe(recipe)}><Ticket aria-hidden="true"/>Pembe Bilet oluştur</button><div className="summary-card">{steps.map((s,i)=><button className="summary-row" key={s.id} onClick={()=>move(i)}><span><strong>{s.label}</strong><span>{optionNames(s.id)}</span></span><PencilSimple/></button>)}</div><label className="note-label">Bir notun var mı?<textarea maxLength={250} value={recipe.note} onChange={e=>setRecipe(r=>({...r,note:e.target.value}))} placeholder="Örn. çikolatası az olsun"/></label><div className="quantity-stepper"><span>Adet</span><button onClick={()=>setRecipe(r=>({...r,qty:Math.max(1,r.qty-1)}))} aria-label="Adedi azalt"><Minus/></button><strong>{recipe.qty}</strong><button onClick={()=>setRecipe(r=>({...r,qty:Math.min(20,r.qty+1)}))} aria-label="Adedi artır"><Plus/></button></div><div className="price-dock"><div className="price-label"><small>Toplam</small><strong className="amount">{format(getPrice(recipe.category,recipe.selections)*recipe.qty)}</strong></div><button className="next-button" onClick={add}>Sepete ekle<CaretRight/></button></div></>}<details className="allergen-note"><summary><Info/> Alerjen bilgisi</summary><p>Ürünler gluten, süt, yumurta, soya ve kuruyemiş içerebilir. Alerjilerini sipariş öncesinde işletme ekibine bildir.</p></details></>
 return <div className="granny-app pink-world" data-view={view}>{intro?<div className="cinema-wrap"><nav className="cinema-nav"><img className="cinema-logo" src="/assets/logo.png" alt="Granny’s Waffles"/><button className="skip-intro" onClick={enter}>Menüye geç<CaretRight/></button></nav><ScrollScrub scenes={scrollScrubScenes} theme={scrollScrubTheme}/><div className="cinema-footer"><div><small>GRANNY’S WAFFLES</small><h2>Şimdi sıra sende.</h2><p>Waffle, bowl, box veya kumpir. Lezzetini sen oluştur.</p></div><button className="enter-menu" onClick={enter}>Menüyü aç<Icon name="sliders"/></button></div></div>:<><div className="storefront-masthead"><header className="app-header"><button className="brand-lockup" onClick={backMenu} aria-label="Ana menü"><span className="brand-logo"><img src="/assets/logo.png" alt=""/></span><span className="brand-name"><strong>Granny’s<br/>Waffles</strong></span>{view!=='menu'&&<span className="recipe-back"><ArrowLeft aria-hidden="true"/>Menüye dön</span>}</button><nav className="desktop-nav" aria-label="Ana gezinme"><button className={!catalogueInView?'active':''} aria-current={!catalogueInView?'location':undefined} onClick={backMenu}><Icon name="sliders"/><span>Kendin yap</span></button><button className={catalogueInView?'active':''} aria-current={catalogueInView?'location':undefined} onClick={()=>{if(view!=='menu'){backMenu();requestAnimationFrame(()=>document.getElementById('hazir-urunler')?.scrollIntoView({behavior:'smooth'}))}else document.getElementById('hazir-urunler')?.scrollIntoView({behavior:'smooth'})}}><ForkKnife className="ui-icon"/><span>Ürünler</span></button><button onClick={()=>setModal('basket')}><Icon name="bag"/><span>Sepet{count>0?' ('+count+')':''}</span></button></nav><div className="header-tools">{view==='menu'&&<button className="club-ticket" onClick={openCard} aria-haspopup="dialog" aria-label={'Büyükanne Kartı, '+cardStatus}>
  <span className="pocket-card" aria-hidden="true"/><span className="card-long-title">Büyükanne Kartı</span><span className="card-short-title">Kartım</span>
  {!!book?.rewards.length&&<small className="pocket-reward" aria-hidden="true">{book.rewards.length}</small>}
 </button>}<button className="table-button" onClick={()=>{setTableDraft(table);setModal('table')}}>Masa {table||'seç'}</button><button className="bag-button" onClick={()=>setModal('basket')} aria-label={'Sepet, '+count+' ürün'}><Icon name="bag"/>{count>0&&<b>{count}</b>}</button></div></header><div className="awning" aria-hidden="true"/></div><main className="app-container">{view==='menu'?<><section className="menu-spread" id="kendin-yap" aria-labelledby="diy-title">
 <header className="spread-heading">
  <picture className="atelier-miniature" aria-hidden="true"><source media="(max-width: 760px)" srcSet="/assets/world/atolye-mini.webp"/><img alt="" src="/assets/world/atolye.webp" width="850" height="850" fetchPriority="high"/></picture>
  <div className="atelier-title"><h1 id="diy-title">Kendin <em>yap</em></h1><p>Malzemelerini seç, tabağında gör.</p></div>
  <button className="film-link" aria-label="Granny’s filmini izle" onClick={()=>{setIntro(true);window.scrollTo({top:0,behavior:'instant'})}}><Play weight="fill" aria-hidden="true"/><span>Filmi izle</span></button>
 </header>
 <div className="diy-grid" aria-label="Kendi ürününü oluştur">{products.map(p=><button className="diy-card" data-dish={p.id} key={p.id} onClick={()=>start(p.id)} aria-label={p.name+' kendin yap'} aria-describedby={'counter-'+p.id+' price-'+p.id}><span className="diy-product"><img src={catalogueImages[diyPhotoId(p.id)]?.cardImage||catalogueImages[diyPhotoId(p.id)]?.image||'/assets/diy/'+p.id+'.webp'} srcSet={cardSrcSet(diyPhotoId(p.id))} sizes="(max-width:760px) 46vw, (max-width:1199px) 27vw, 350px" decoding="async" alt=""/><span className="counter-price" id={'price-'+p.id}>{format(Math.min(...p.options.map(o=>o.price??p.price)))}{p.options.some(o=>o.price!==p.options[0]?.price)?'’den':''}</span></span><span className="diy-card-caption"><span><strong><img className="shop-lettering" src={'/assets/world/name-'+p.id+'.webp'} alt={p.name}/></strong><small id={'counter-'+p.id}>{categoryCaptions[p.id]}</small></span><CaretRight/></span></button>)}</div></section>
 <section className="club-counter" aria-label="Granny’s müdavim kulübü">
 <div className="notebook-entry"><button onClick={openCard}><img src="/assets/world/granny-posy.webp" width="48" height="48" alt=""/><span className="notebook-entry-label"><strong>Büyükanne Kartı</strong><small>{book?.rewards.length?cardStatus:book?.amount?'4 damgada '+format(book.amount)+' ikram':'Damgalarım ve kayıtlı tariflerim'}</small></span>{book&&<span className="club-progress" aria-label={(book.total%4)+' / 4 damga'}>{[0,1,2,3].map(i=><span key={i} className={i<book.total%4?'earned':''} aria-hidden="true"/>)}</span>}<CaretRight/></button>{favorites[0]&&<button className="last-recipe" onClick={()=>openRecipe(favorites[0]!)}>Geçen tarifim · {favorites[0].recipeName||categoryName(favorites[0].category)}</button>}</div>
 <button className="month-entry" onClick={()=>setModal('month')}><Medal weight="duotone" className="month-medal" aria-hidden="true"/><span className="month-copy"><strong>Ayın Granny’s Tarifi</strong><small>Tarifini aday göster veya oy ver</small></span><CaretRight className="month-forward" aria-hidden="true"/></button>
 </section>
 <section className="ready-section" id="hazir-urunler">
 <div className="ready-heading"><div><h2>Hazır lezzetler</h2></div><button onClick={()=>setModal('menu')}>Fiyat listesi<CaretRight/></button></div>
 <div className="catalogue-search"><label htmlFor="menu-search">Menüde ara</label><div className="atelier-search"><label className="search-icon" htmlFor="menu-search" aria-hidden="true"><MagnifyingGlass/></label><input id="menu-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Waffle, brownie, kumpir…" autoComplete="off"/>{query&&<button aria-label="Aramayı temizle" onClick={()=>{setQuery('');document.getElementById('menu-search')?.focus()}}><X/></button>}</div></div>
 <div className="category-bar catalogue-filters" aria-label="Katalog kategorileri"><button className={categoryFilter==='all'?'active':''} aria-pressed={categoryFilter==='all'} onClick={()=>setCategoryFilter('all')}>Tümü</button>{products.map(p=><button key={p.id} className={categoryFilter===p.id?'active':''} aria-pressed={categoryFilter===p.id} onClick={()=>setCategoryFilter(p.id)}>{p.name}</button>)}<button className={categoryFilter==='extras'?'active':''} aria-pressed={categoryFilter==='extras'} onClick={()=>setCategoryFilter('extras')}>Ekstralar</button></div>
 <div className="catalogue-meta"><span className="catalogue-count" role="status">{resultCount}</span><small className="catalogue-source-note">Basılı menü fiyatları</small></div>
 {visibleCatalogue.length>0&&<div className="ready-grid">{visibleCatalogue.map(item=>{const photo=catalogueImages[item.id];return <article className="ready-card catalogue-card" key={item.id} data-product-id={item.id}>
 <button className="ready-photo" onClick={()=>openDetail(item)} aria-label={item.name+' detayları'}>{photo&&<img src={photo.cardImage||photo.image} srcSet={cardSrcSet(item.id)} sizes="(max-width:620px) 35vw, (max-width:1000px) 30vw, 270px" decoding="async" alt={photo.photoKind==='base-reference'?item.name+' taban sunum referansı':photo.photoKind==='illustrative'?item.name+' için temsili sunum':item.name+' şube sunum fotoğrafı'} loading="lazy"/>}{photo?.photoKind==='base-reference'&&<span className="catalogue-photo-label">{photo.photoLabel||'Taban referansı'}</span>}{photo?.photoKind==='illustrative'&&<span className="catalogue-photo-label">Temsili sunum</span>}</button>
 <div className="ready-card-info"><div className="catalogue-topline"><span className="catalogue-category">{categoryName(item.category)}</span>{item.portion&&<span className="catalogue-portion">{item.portion}</span>}</div><h3>{item.name}</h3><p className="catalogue-ingredients">{item.description}</p><strong className="ready-card-price">{format(item.price)}</strong></div>
 <div className="catalogue-actions">
  <button className="add-standard" onClick={()=>addStandard(item)} aria-label={(item.name+(item.portion?' '+item.portion:''))+' sepete ekle'}><Plus aria-hidden="true"/>Sepete ekle</button>
  <button className="catalogue-info-button" onClick={()=>openDetail(item)}>İçeriği gör<CaretRight/></button>
 </div></article>})}</div>}
 {visibleExtras.length>0&&<ul className="extras-list" aria-label="Ekstralar">
  {visibleExtras.map(extra=><li className="extra-row" key={extra.name}>
   <strong>{extra.name}</strong><span>{format(extra.price)}</span>
  </li>)}
 </ul>}
 {!visibleCatalogue.length&&!visibleExtras.length&&<div className="catalogue-no-results"><h3>Bu lezzeti bulamadık.</h3><p>Başka bir kelime dene veya tüm kategorilere göz at.</p><button onClick={()=>{setQuery('');setCategoryFilter('all')}}>Tüm menüyü göster</button></div>}
 </section><div className="menu-shortcuts"><button onClick={openNotebook}><Icon name="heart"/>Tarif Defterim</button><button onClick={()=>{setIntro(true);window.scrollTo({top:0,behavior:'instant'})}}>Granny’s filmini izle</button></div></>:<><div className="builder-topline"><button onClick={backMenu}><ArrowLeft/> Menüye dön</button><span>{view==='summary'?'Tarif özeti':stepIndex+1+' / '+steps.length}</span></div><div className="builder-layout"><section className="product-studio" aria-label="Canlı ürün önizlemesi"><div className="studio-header"><span className="studio-title">{product.title}</span><div className="studio-actions"><button className="preview-clear" disabled={summarize(recipe.category,recipe.selections).length<=1} onClick={()=>setRecipe(r=>({...r,thumb:'',selections:{base:r.selections.base||newRecipe(r.category).selections.base},sauceWells:{}}))}>Temizle</button><button className="favorite-button" onClick={save} aria-label="Tarifi favorilere ekle"><Icon name="heart"/></button></div></div><FoodPreview category={recipe.category} selections={recipe.selections} sauceWells={recipe.sauceWells} onSnapshot={snapshotCallback}/><button type="button" className="atelier-zoom" onClick={()=>setModal('plate')}><ArrowsOutSimple aria-hidden="true"/> Yakından bak</button><div className="selection-chips" aria-live="polite">{summarize(recipe.category,recipe.selections).slice(1).map(n=><span key={n}>{n}</span>)}</div></section><section className="builder-controls" aria-label="Malzeme seçimi">{controls}</section></div></>}</main><nav className="bottom-nav" aria-label="Ana gezinme">{cardNav}<button className={!catalogueInView?'active':''} aria-current={!catalogueInView?'location':undefined} onClick={backMenu}><Icon name="sliders"/><span>Kendin yap</span></button><button className={catalogueInView?'active':''} aria-current={catalogueInView?'location':undefined} onClick={()=>{if(view!=='menu'){backMenu();requestAnimationFrame(()=>document.getElementById('hazir-urunler')?.scrollIntoView({behavior:'smooth'}))}else document.getElementById('hazir-urunler')?.scrollIntoView({behavior:'smooth'})}}><ForkKnife className="ui-icon"/><span>Ürünler</span></button><button onClick={()=>setModal('basket')}><Icon name="bag"/><span>Sepet{count>0?' ('+count+')':''}</span></button></nav></>}
 <dialog ref={dialogRef} aria-labelledby="granny-dialog-title" className={'modal-panel'+(modal==='plate'?' plate-dialog':modal==='favorites'?' notebook-dialog':modal==='ticket'?' pink-billet-dialog':modal==='month'?' monthly-dialog':'')} onClose={()=>setReceiptCode('')} onCancel={()=>setModal(null)} onClick={e=>{if(e.target===e.currentTarget)setModal(null)}}><div className="modal-header"><h2 id="granny-dialog-title">{modal==='ticket'?'Pembe Bilet':modal==='month'?'Ayın Granny’s Tarifi':modal==='plate'?product.title:modal==='basket'?'Sepetindeki mutluluk':modal==='name'?'Tarifine isim ver':modal==='favorites'?'Büyükanne Kartı':(modal==='table'||modal==='basket-table')?'Hangi masadasın?':modal==='menu'?'Granny’s menüsü':modal==='product'?(detail?.name||'Ürün detayı'):'Lezzetin hazır.'}</h2><button className="modal-close" onClick={()=>setModal(null)} aria-label="Kapat"><X/></button></div><div className="modal-body">
 {(modal==='ticket'||modal==='month')&&!book&&<div className="club-sheet"><p role="status">{wallet.error||'Kartın açılıyor…'}</p>{wallet.error&&<button onClick={wallet.refresh}>Yeniden dene</button>}</div>}
 {modal==='ticket'&&book&&<TicketView key={ticketId||'personal'} id={ticketId} draft={ticketDraft} onPrepare={r=>{const [valid]=restoreRecipes([r]);if(valid)openRecipe(valid);else message('Bu tarif güncel menüde bulunamadı.')}}/>}
 {modal==='month'&&book&&<Monthly onOpen={readTicket} onStart={backMenu}/>}
 {modal==='plate'&&<div className="plate-inspect"><FoodPreview category={recipe.category} selections={recipe.selections} sauceWells={recipe.sauceWells}/><small>SEÇTİĞİN MALZEMELER</small><p>{summarize(recipe.category,recipe.selections).join(' · ')}</p><button className="basket-action" onClick={()=>setModal(null)}>Tarifime dön</button></div>}
 {modal==='product'&&detail&&<>{catalogueImages[detail.id]&&<div className="product-detail-photo"><img src={catalogueImages[detail.id]!.image} alt={detail.name+' sunum referansı'}/></div>}{detail.portion&&<span className="detail-portion">{detail.portion}</span>}<div className="detail-price"><span>Basılı menü fiyatı</span><strong>{format(detail.price)}</strong></div><div className="detail-purchase"><button className="add-standard" onClick={()=>addStandard(detail,true)}><Plus aria-hidden="true"/>Sepete ekle</button>{detail.configurable&&detail.baseId&&<button className="detail-configure" onClick={()=>startCatalogue(detail)}>Kendin hazırla<CaretRight/></button>}</div>{catalogueImages[detail.id]?.photoNote&&<p className="recipe-note">{catalogueImages[detail.id]!.photoNote}</p>}<div className="ingredient-groups"><h3>Ana malzemeler</h3>{detail.coreIngredients.length?<ul>{detail.coreIngredients.map(n=><li key={n}>{n}</li>)}</ul>:<p>Ayrıntılı reçete şubeden teyit edilecek.</p>}<h3>Seçilebilir malzemeler</h3>{detail.selectableIngredients.length?<ul>{detail.selectableIngredients.map(n=><li key={n}>{n}</li>)}</ul>:<p>Bu üründeki değişiklik seçenekleri için şube ekibinden bilgi alabilirsin.</p>}</div>{detail.recipeNote&&<p className="recipe-note">{detail.recipeNote}</p>}</>}
 {(modal==='table'||modal==='basket-table')&&<form onSubmit={e=>{e.preventDefault();if(!/^\d{1,4}$/.test(tableDraft))return;setTable(tableDraft);setModal(modal==='basket-table'?'basket':null);message('Masa '+tableDraft+' kaydedildi.')}}><p>QR bağlantısındaki masa numarası otomatik seçilir.</p><label className="note-label">Masa numarası<input type="text" inputMode="numeric" maxLength={4} pattern="[0-9]{1,4}" required value={tableDraft} onChange={e=>setTableDraft(e.target.value)} placeholder="Örn. 12"/></label><button className="basket-action" type="submit">Masayı kaydet</button></form>}
 {modal==='basket'&&<button className="basket-table" onClick={()=>{setTableDraft(table);setModal('basket-table')}}>Masa {table||'seç'}<PencilSimple aria-hidden="true"/></button>}
 {modal==='basket'&&(basket.length?<><p className="basket-intro">Seçimlerini gözden geçir, sonra özeti ekibimize göster.</p>{basket.map(b=><div className="cart-row" key={b.id}><img className="cart-thumb" src={b.thumb||products.find(p=>p.id===b.category)!.photo} alt={b.title}/><div className="cart-details"><strong>{b.title}</strong><p>{b.names.join(', ')}</p>{b.note&&<p>Not: {b.note}</p>}<div className="quantity-stepper"><button onClick={()=>changeQuantity(b.id,-1)} aria-label="Adedi azalt"><Minus/></button><span>{b.qty}</span><button disabled={b.qty>=20} onClick={()=>changeQuantity(b.id,1)} aria-label="Adedi artır"><Plus/></button></div></div><strong>{format(b.qty*b.price)}</strong></div>)}<div className="cart-total"><span>Toplam</span><strong>{format(total)}</strong></div><button className="basket-action" onClick={()=>setModal('review')}>Seçimlerimi özetle</button><p className="service-note">Sipariş ve ödeme bağlantısı henüz kurulmadı. Seçimlerin bu cihazda saklanır.</p></>:<Empty icon="bag" title="Biraz mutluluk ekleyelim." text="Sepetin henüz boş."><button className="basket-action" onClick={()=>start(active)}>Kendin oluştur</button></Empty>)}
 {modal==='name'&&<form className="loyalty-save" onSubmit={e=>{e.preventDefault();saveNamed()}}><label>Tarif adı<input value={recipeName} maxLength={48} required onChange={e=>setRecipeName(e.target.value)} placeholder="Pazar waffle’ım"/></label>{favorites.some(f=>f.recipeName===recipeName.trim())&&<p>Bu isimdeki tarifin yeni seçimlerle güncellenecek.</p>}<button disabled={!recipeName.trim()}>Defterime kaydet</button></form>}
 {modal==='favorites'&&<>
  <div className="wallet-switch" role="group" aria-label="Büyükanne Kartı bölümleri">
   <button aria-pressed={walletPage==='card'} onClick={()=>setWalletPage('card')}><Stamp aria-hidden="true"/>Damgalar</button>
   <button aria-pressed={walletPage==='recipes'} onClick={()=>setWalletPage('recipes')}><Heart aria-hidden="true"/>Tarif defterim{favorites.length>0&&<span>{favorites.length}</span>}</button>
  </div><div hidden={walletPage!=='card'}><StampCard key={receiptCode} initialCode={receiptCode} wallet={wallet}/>{book&&<Backup recipes={favorites} book={book} onRestore={(b,items)=>{
  wallet.accept(b)
  const imported=restoreRecipes(items)
  setFavorites(previous=>{
   const key=(r:Recipe)=>JSON.stringify({...pack(r),qty:r.qty,note:r.note})
   const seen=new Set<string>()
   return [...imported,...previous].filter(r=>{const id=key(r);if(seen.has(id))return false;seen.add(id);return true}).slice(0,50)
  })
 }}/>}</div></>}
 {modal==='favorites'&&walletPage==='recipes'&&(favorites.length?favorites.map((f,i)=><div className="cart-row" key={i}><img className="cart-thumb" src={f.thumb||products.find(p=>p.id===f.category)!.photo} alt=""/><div className="cart-details"><strong>{f.recipeName||products.find(p=>p.id===f.category)!.title}</strong><p>{summarize(f.category,f.selections).join(', ')}</p><button className="gallery-link" onClick={()=>openRecipe(f)}>Tarifi aç</button><button className="gallery-link" onClick={()=>shareRecipe(f)}>Pembe Bilet</button></div><button className="modal-close" onClick={()=>setFavorites(v=>v.filter((_,n)=>i!==n))} aria-label="Favoriden kaldır"><X/></button></div>):<div className="notebook-empty"><img src="/assets/waffle-stamp.webp" alt=""/><h3>İlk tarifin için yer ayırdık.</h3><p>Tabağını hazırladıktan sonra “Tarif defterime kaydet”e dokun.</p><button className="basket-action" onClick={backMenu}>Kendin Yap’a dön</button></div>)}
 {modal==='menu'&&<div className="full-menu"><p>Paylaşılan basılı menüdeki ürünler ve fiyatlar.</p>{Object.entries(allMenu).map(([name,items])=><section key={name}><h3>{name}</h3>{items.map(o=><div className="summary-row" key={o.name}><span>{o.name}</span><strong>{format(o.price)}</strong></div>)}</section>)}</div>}
 {modal==='review'&&<><p>Bu özeti işletme ekibine gösterebilirsin. Sipariş otomatik gönderilmedi.</p>{table&&<h3>Masa {table}</h3>}{basket.map(b=><div className="summary-card" key={b.id}><div className="summary-row"><strong>{b.qty} × {b.title}</strong><strong>{format(b.qty*b.price)}</strong></div><p>{b.names.join(', ')}</p>{b.note&&<p>Not: {b.note}</p>}</div>)}<div className="cart-total"><span>Toplam</span><strong>{format(total)}</strong></div><button className="basket-action" onClick={()=>setModal(null)}>Tamam</button><button className="review-card" onClick={openCard}><Stamp aria-hidden="true"/>Büyükanne Kartı’nı aç<CaretRight aria-hidden="true"/></button></>}
 </div></dialog>{toast&&<div className="toast" role="status">{toast}</div>}</div>
}
function Empty({icon,title,text,children}:{icon:string;title:string;text:string;children?:ReactNode}){return <div className="empty-state"><span className="empty-icon"><Icon name={icon}/></span><h3>{title}</h3><p>{text}</p>{children}</div>}
