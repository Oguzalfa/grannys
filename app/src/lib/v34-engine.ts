// @ts-nocheck
// Reviewed rendering primitives copied from the user-supplied Grannys engine.
// Source and bounded adapter changes are recorded in refs/sauce-algorithm-provenance.md.
import type { V34Engine } from './v34-types'
export function createV34Engine(svg: SVGSVGElement, prefix: string): V34Engine {
const chocolate=[['Sütlü','drizzle','#743b25'],['Beyaz','drizzle','#fff0cb'],['Bitter','drizzle','#482416'],['Fındıklı','drizzle','#9a5a37'],['Çilekli','drizzle','#cc5264'],['Antep fıstıklı','drizzle','#849a50'],['Karamelli','drizzle','#ba732d'],['Frambuazlı','drizzle','#a73052']];
const fruits=[['Çilek','strawberry'],['Muz','banana'],['Kivi','kiwi'],['Ananas','pineapple']];
const toppings=[['Oreo bisküvi','crumb','#352421'],['Hindistan cevizi','flake','#fff7e6'],['Kavrulmuş yer fıstığı','crumb','#bb7850'],['Lotus bisküvi','crumb','#96502a'],['Fındık','crumb','#b9814f'],['Ceviz','crumb','#a66e4a'],['Haribo','gummy','#e94463']];
const specials=[['Ev yapımı süt reçeli','drizzle','#ad6d3c'],['Magnolya kreması','drizzle','#eed3a3'],['Kestane şekeri','crumb','#ab724d'],['Ev yapımı brownie','crumb','#5b3024']];
const group=(key,label,items,limit)=>({key,label,items,limit});
const products={
 waffle:{title:'Waffle & Bowl',base:[['Granny’s Waffle','s-waffle'],['Brüksel Waffle','s-sheet'],['Bowl Orta','s-bowl'],['Bowl Büyük','s-bowl']],steps:[group('sauce','Çikolata',chocolate,2),group('fruit','Meyve',fruits),group('topping','Süsleme',toppings,3),group('special','Spesiyal',specials,2)]},
 box:{title:'Granny’s Box',base:[['Granny’s Box','s-box']],steps:[group('fruit','Meyve bölmesi',fruits),{...group('sauce','Sos bölmesi',chocolate,2),wells:true}]},
 kumpir:{title:'Kumpir',base:[['Kumpir','s-potato']],steps:[group('savoury','Malzeme',[['Mısır','corn'],['Kornişon','pickle'],['Zeytin','olive'],['Havuç','carrot'],['Ekstra kaşar','flake','#ffdf8b']])]}
};
const photoByGroup={
 sauce:['milk','white','dark','hazel-sauce','straw-sauce','pistachio-sauce','caramel','rasp-sauce'],
 fruit:['strawberry','banana','kiwi','pineapple'],
 topping:['oreo','coconut','peanut','lotus','hazelnut','walnut','haribo'],
 special:['milk-jam','cream','chestnut','brownie'],
 savoury:['corn','pickle','olive','carrot','cheese']
};
const createState=()=>Object.fromEntries(Object.keys(products).map(key=>[key,{base:0,step:0,picks:{},order:[],sauceWells:{},placements:{}}]));
function toggleSelection(state,g,index){
 const picked=state.picks[g.key]??[];
 if(picked.includes(index)){for(const plans of Object.values(state.placements))delete plans[g.key+':'+index];if(g.wells)delete state.sauceWells[index];state.picks[g.key]=picked.filter(x=>x!==index);state.order=state.order.filter(([k,i])=>k!==g.key||i!==index);return 'removed';}
 if(g.limit&&picked.length>=g.limit)return 'limit';
 if(g.wells)state.sauceWells[index]=Object.values(state.sauceWells).includes(0)?1:0;
 state.picks[g.key]=[...picked,index];state.order.push([g.key,index]);return 'added';
}
const portions=(()=>{
 const profiles={
  's-waffle':{area:[[92,147],[109,117],[140,88],[174,76],[209,71],[246,77],[286,91],[320,116],[332,141],[322,174],[291,199],[248,214],[204,215],[158,206],[122,189],[96,170]],scale:1.13,fill:1.20},
  's-sheet':{area:[[75,105],[282,62],[340,165],[115,206]],scale:1.14,fill:1.18},
  's-bowl':{area:[[109,105],[126,82],[164,61],[216,58],[263,65],[298,88],[315,114],[298,135],[267,153],[220,167],[181,163],[145,149],[116,127]],scale:1.16,fill:1.25},
  's-bowl-large':{area:[[101,100],[117,74],[157,53],[216,49],[270,58],[308,80],[327,109],[308,133],[275,154],[221,170],[178,164],[138,148],[108,125]],scale:1.27,fill:1.38},
  's-potato':{area:[[105,147],[113,125],[142,101],[178,78],[224,58],[267,50],[302,52],[317,73],[308,89],[270,111],[226,130],[184,149],[138,163],[111,160]],scale:1.21,fill:1.20},
  's-box-left':{area:[[153,65],[202,37],[280,52],[232,82]],scale:.80,fill:1.24},
  's-box-right':{area:[[246,93],[290,64],[369,80],[322,114]],scale:.80,fill:1.24}
 };
 const recipe={
  strawberry:[7,33,45],banana:[8,30,54],kiwi:[6,35,38],pineapple:[8,28,66],
  oreo:[7,23,72],coconut:[8,22,80],peanut:[7,23,80],lotus:[7,22,80],hazelnut:[7,23,74],walnut:[7,24,65],haribo:[5,21,65],
  chestnut:[4,28,74],brownie:[4,28,54],
  corn:[12,27,90],pickle:[9,30,64],olive:[10,24,86],carrot:[10,30,70],cheese:[11,29,86]
 };
 const fruitNames=['strawberry','banana','kiwi','pineapple'];
 const boxCorners={
  's-box-left':[[157,69],[202,44],[271,61],[226,86]],
  's-box-right':[[251,94],[295,70],[367,90],[323,114]]
 };
 const boxLayout=[
  [.18,.80],[.34,.84],[.55,.85],[.77,.79],
  [.15,.54],[.35,.57],[.60,.56],[.80,.53],
  [.21,.30],[.43,.29],[.65,.27],[.80,.34]
 ];
 function makeBoxMix(name,ingredients){
   if(!boxCorners[name]||!ingredients.length)return {};
   const [[ax,ay],[bx,by],[cx,cy],[dx,dy]]=boxCorners[name];
   const result=Object.fromEntries(ingredients.map(x=>[x,[]]));
   const order=[0,1,2,3,5,4,7,6,8,9,10,11];
   for(const [slot,[u,v]] of boxLayout.entries()){
     const asset=ingredients[order[slot]%ingredients.length],i=fruitNames.indexOf(asset);
     const R=rand(seed(name+'-'+asset+'-'+slot));
     const x=ax*(1-u)*(1-v)+dx*u*(1-v)+bx*(1-u)*v+cx*u*v+(R()-.5)*3;
     const floorY=ay*(1-u)*(1-v)+dy*u*(1-v)+by*(1-u)*v+cy*u*v;
     const y=floorY-1.8-(v>.72?2:0)+(R()-.5)*2;
     const w=[24,25,26,24][i],variant=[1,0,2,1,0,2,1,0,2,1,0,2][slot];
     const size=w*(.88+R()*.20);
     result[asset].push({x,y,depth:floorY,slot,size,variant,angle:(R()-.5)*58,tone:.95+R()*.10});
   }
   return result;
 }
 const seed=(text)=>{let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
 function rand(s){return()=>{s=(s+0x6d2b79f5)|0;let t=Math.imul(s^(s>>>15),1|s);t=t+Math.imul(t^(t>>>7),61|t)^t;return ((t^(t>>>14))>>>0)/4294967296;};}
 function within(x,y,poly){
  let inside=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
   const [xi,yi]=poly[i],[xj,yj]=poly[j];
   if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;
  }
  return inside;
 }
 function makePlan(profileName,ingredient,occupants=[]){
  const profile=profiles[profileName], params=recipe[ingredient];
  if(!profile||!params)return [];
  if(boxCorners[profileName]&&fruitNames.includes(ingredient))return makeBoxMix(profileName,[ingredient])[ingredient];
  const poly=profile.area, xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);
  const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
  const midx=(x0+x1)/2,midy=(y0+y1)/2;
  const isBox=profileName.startsWith('s-box'),[amount,size,swivel]=params;
  const fruit=fruitNames.includes(ingredient);
  const plated=profileName==='s-waffle'||profileName==='s-sheet';
  const total=Math.round(amount*(profile.fill??(isBox?.75:1))*(fruit?1.28:profileName==='s-potato'?1.19:1));
  const bowl=profileName.startsWith('s-bowl');
  const R=rand(seed(profileName+'_'+ingredient)),points=[];
  for(let ix=0;ix<total;ix++){
   let piece=(.81+R()*.30)*size*profile.scale*(fruit?(plated?1.07:.99):1);
   let ang=(R()*2-1)*swivel;
   const radius=piece*(fruit&&(bowl||plated)?.30:.40);
   let best=null, bestScore=-Infinity;
   for(let tryNo=0;tryNo<86;tryNo++){
    const x=x0+R()*(x1-x0),y=y0+R()*(y1-y0);
    if(!within(x,y,poly)||![[radius,0],[-radius,0],[0,radius],[0,-radius]].every(([dx,dy])=>within(x+dx,y+dy,poly)))continue;
    const dist=q=>Math.hypot(q.x-x,q.y-y);
    const spaces=points.map(q=>dist(q)-((fruit?.39:.52)*q.size+(fruit?.31:.40)*piece));
    const foreign=occupants.map(q=>dist(q)-((fruit?.27:.34)*q.size+(fruit?.27:.34)*piece));
    const crowd=spaces.length?Math.min(...spaces):0;
    const clash=foreign.reduce((pen,v)=>pen+Math.max(0,-v)**1.25,0);
    const centerPull=Math.hypot((x-midx)/(x1-x0),(y-midy)/(y1-y0));
    let score=ix===0?-centerPull*72:Math.min(crowd,34)*1.25-centerPull*(bowl?4:9);
    score-=clash*.78;score+=R()*(fruit?5.6:2.4);
    if(score>bestScore){bestScore=score;best={x,y,size:piece,angle:ang,tone:.92+R()*.14,...(fruit?{variant:[0,1,0,2,1,2][ix%6]}:{})};}
   }
   if(!best)continue;
   for(const k of ['x','y','size','angle','tone'])best[k]=Math.round(best[k]*100)/100;
   points.push(best);
  }
  return points;
 }
 return {makePlan,makeBoxMix,within,profiles};
})();
function makeSvg(tag,attrs){
 const x=document.createElementNS('http://www.w3.org/2000/svg',tag);
 const set=x.setAttribute.bind(x);
 x.setAttribute=(key,value)=>set(key,key==='id'?prefix+'-'+value:String(value).replace(/url\(#([^)]*)\)/g,(_,id)=>'url(#'+prefix+'-'+id+')'));
 for(const [k,v] of Object.entries(attrs))x.setAttribute(k,v);return x;
}
function bitmap(name,x,y,w,h,angle=0){
 return makeSvg('image',{href:'/assets/v34/'+name+'.webp',x:x-w/2,y:y-h/2,width:w,height:h,transform:angle?'rotate('+angle+' '+x+' '+y+')':'',preserveAspectRatio:'xMidYMid meet',class:'food-photo'});
}
// A composition is anchored to the same photograph for every selection.
const sceneFrames={
 's-waffle':{asset:'scene-papatya-base',x:210,y:145,w:359,h:219,clip:'M80 147Q82 119 103 110Q100 86 130 82Q137 59 173 67Q196 53 219 64Q252 56 263 71Q296 70 304 90Q322 96 324 118Q342 128 341 148Q344 171 322 179Q318 201 288 203Q266 224 239 221Q215 230 189 219Q158 225 141 211Q106 213 98 188Q77 179 80 147Z'},
 's-sheet':{asset:'scene-brussels-base',x:210,y:145,w:356,h:237,clip:'M65 106Q64 94 81 90L274 56Q285 53 291 67L344 156Q351 170 337 177L124 215Q105 221 99 201Z'},
 's-bowl':{asset:'scene-bowl-base',x:210,y:145,w:247,h:241,clip:'M102 111Q103 90 122 80Q134 77 146 82L172 55Q183 54 194 40Q208 37 219 52L236 69Q249 67 261 60Q279 65 288 76Q311 86 320 111Q322 128 309 140Q287 160 259 168Q230 177 199 173Q166 170 143 157Q116 145 102 128Z'},
 's-potato':{asset:'scene-kumpir-base',x:210,y:147,w:367,h:232,clip:'M99 150Q95 132 112 108Q143 72 183 53Q220 36 255 34Q292 32 315 49Q334 65 323 89Q309 106 271 121Q231 136 190 150Q142 175 110 174Q102 168 99 150Z'},
 's-box':{asset:'scene-box-base',x:210,y:143,w:360,h:260,wells:[[180,89,35,16],[270,115,35,17]]}
};
const photographSprite=name=>sceneSprites[name]??name;
const sceneSprites={strawberry:'scene-strawberry',banana:'scene-banana',kiwi:'scene-kiwi',pineapple:'scene-pineapple',corn:'scene-corn',pickle:'scene-pickle',olive:'scene-olive',carrot:'scene-carrot',cheese:'scene-kasar',brownie:'scene-brownie'};
function edibleClip(frame,large){
 if(!frame.clip)return null;
 const clip=makeSvg('clipPath',{id:'edible-scene',clipPathUnits:'userSpaceOnUse'});
 const p=makeSvg('path',{d:frame.clip});
 if(large)p.setAttribute('transform','translate(210 145) scale(1.12) translate(-210 -145)');
 clip.append(p);return clip;
}
const sauceFootprints={
 's-bowl':[[151,89,52,21,-15],[179,71,36,17,26],[211,89,45,28,25],[253,82,46,25,-7],[281,103,43,21,19],[248,122,53,18,-9],[190,120,43,18,12],[128,105,25,12,-15]],
 's-waffle':[[140,127,61,27,7],[169,102,64,27,-8],[205,132,75,34,-12],[250,103,61,26,18],[287,142,53,33,1],[250,169,78,29,-18],[178,175,66,28,13],[126,159,40,22,22]],
 's-sheet':[[119,115,59,25,-11],[167,99,69,31,-7],[221,111,79,31,-17],[271,100,64,23,-12],[297,147,61,31,-10],[238,155,84,29,-16],[169,165,80,27,-12],[125,159,45,25,2]]
};
function saucePhoto(asset,x,y,w,h,angle=0,flow=null){
 const source=flow!==null&&(asset==='milk'||asset==='white')?'flow-'+asset+'-'+flow:'splash-'+asset;
 const img=bitmap(source,x,y,w,h,angle);
 img.setAttribute('preserveAspectRatio','none');
 img.setAttribute('style','filter:drop-shadow(0 1px 1px #38180b55)');
 return img;
}
const coatPalette=[
 ['#220c07','#542516','#743823','#975539','#b77b5c','#d3ae94'], // Sütlü
 ['#604322','#ae8149','#d4a96b','#e7c790','#f5deb0','#fff5d7'], // Beyaz
 ['#170907','#34160f','#4d2419','#663427','#8c543f','#b58169'], // Bitter
 ['#2c1007','#65341d','#92502e','#ae6b43','#cf936b','#e8bf97'], // Fındıklı
 ['#4d1627','#92354a','#b95664','#d87c85','#eb9fa1','#fac2bc'], // Çilekli
 ['#272b0c','#53581e','#788039','#9ca251','#b8bd76','#d5d697'], // Antep
 ['#3d1306','#84370c','#ac4e15','#cf792c','#e79142','#ffd99c'], // Karamelli
 ['#3c0d1e','#781b36','#a43350','#c4546b','#d86f83','#ef9c9e']  // Frambuaz
];
const coatPaths={
 's-waffle':'M83 147Q80 137 94 125Q103 117 103 110Q103 94 127 94Q135 91 139 81Q144 72 165 75Q173 75 181 70Q190 63 208 70Q214 72 225 67Q244 64 256 76Q267 79 279 77Q297 79 302 94Q302 103 313 105Q328 111 325 126Q326 132 333 139Q338 152 329 162Q321 171 317 182Q313 193 296 192Q287 196 282 203Q276 214 257 210Q248 207 241 213Q225 223 210 218Q201 218 194 212Q188 211 178 213Q162 217 152 209Q147 204 139 203Q125 208 117 196Q111 189 105 186Q92 184 91 171Q86 164 83 147Z',
 's-sheet':'M76 102Q74 94 88 90L273 57Q283 55 290 67L339 151Q347 160 333 167L123 203Q112 207 107 194Z',
 's-bowl':'M107 104Q105 94 118 88L124 79Q131 75 153 78L165 68Q169 57 185 58L192 50Q201 47 207 44Q217 43 224 57L235 71Q244 70 255 76Q262 73 270 65Q283 65 288 74L296 93Q303 94 311 102Q315 108 309 118L287 133Q269 145 243 149Q236 154 214 155Q181 153 153 141Q126 130 114 118Z'
};
// Individual coated waffle facets, native Bowl photo coordinates (920 × 898).
const bowlFacets=[
 'M357 159Q382 147 404 153Q451 140 496 110Q516 109 538 134L563 165Q568 181 548 196Q524 214 494 214Q464 227 443 210Q419 194 390 202Q373 198 355 183Z',
 'M119 237Q139 219 166 230Q187 241 211 233L246 240Q255 249 250 265Q235 288 228 309Q223 326 200 332L174 319Q151 323 131 307Q120 294 119 272Z',
 'M263 245Q280 228 299 240Q325 248 348 235Q375 232 402 255Q410 274 396 286Q378 292 369 310Q360 330 345 344Q317 348 305 332Q294 316 270 319Q253 311 250 296Z',
 'M435 260Q457 244 479 245Q500 246 513 231Q534 238 546 256Q573 270 592 281Q602 301 581 320Q553 329 545 353Q531 372 507 371Q482 358 462 362Q444 353 425 340L412 313Z',
 'M623 171Q649 174 672 165Q701 162 719 149Q733 155 741 175L754 206Q754 230 728 243Q708 237 690 227Q666 220 642 226L622 208Z',
 'M663 275Q681 251 707 257L742 274Q761 285 768 306Q787 314 819 325Q840 338 835 352Q831 370 809 379L781 375Q753 375 727 369L698 353Q681 345 651 351Q629 344 630 319Z',
 'M584 394Q599 369 627 365L654 379Q673 391 685 411Q706 418 723 445Q731 460 710 477Q688 491 666 483Q645 468 614 470Q598 458 582 435Z',
 'M143 446Q164 424 190 424L221 416Q244 405 264 421Q284 425 308 406Q337 402 355 418Q363 435 350 461L335 484Q305 498 276 491Q250 485 219 493Q192 488 161 476Z',
 'M405 476Q424 450 454 446Q476 436 499 446Q523 455 532 476Q548 496 573 507Q577 527 553 535L508 544Q481 545 454 535Q421 532 397 515L378 499Z'
];
function coatBowl(g,frame,choice){
 const id='bowl-coated-facets-'+choice;
 const cut=makeSvg('clipPath',{id,clipPathUnits:'userSpaceOnUse'});
 cut.append(makeSvg('path',{d:bowlFacets.join(' '),transform:'translate(86.5 24.5) scale(.26848)'}));g.append(cut);
 const filter=makeSvg('filter',{id:'bowl-coated-photo-'+choice,'color-interpolation-filters':'sRGB'});
 filter.append(makeSvg('feGaussianBlur',{stdDeviation:'.52'}),makeSvg('feColorMatrix',{type:'matrix',values:'0.30 0.54 0.16 0 0  0.30 0.54 0.16 0 0  0.30 0.54 0.16 0 0  0 0 0 1 0'}));
 const curves=makeSvg('feComponentTransfer',{});
 ['R','G','B'].forEach((c,i)=>curves.append(makeSvg('feFunc'+c,{type:'table',tableValues:coatPalette[choice].map(x=>(parseInt(x.slice(1+i*2,3+i*2),16)/255).toFixed(4)).join(' ')})));
 filter.append(curves);g.append(filter);
 const surface=makeSvg('g',{'clip-path':'url(#'+id+')','data-bowl-coat':'facets'});
 const photo=bitmap(frame.asset,frame.x,frame.y,frame.w,frame.h);
 photo.setAttribute('style','filter:url(#bowl-coated-photo-'+choice+')');
 const accent=photoByGroup.sauce[choice];
 const glaze=bitmap('well-'+accent,213,102,228,128);
 glaze.setAttribute('preserveAspectRatio','none');
 photo.setAttribute('opacity','.54');
 glaze.setAttribute('opacity','.84');
 surface.append(glaze,photo);
 [[137,99,39,20,-12],[166,120,48,25,-24],[201,72,42,23,21],[214,110,44,25,16],[254,88,49,23,-19],[286,111,39,20,23],[153,145,49,26,-12],[190,148,44,20,11],[220,158,48,23,21],[261,138,52,22,24],[284,128,33,17,-18]].forEach(([x,y,w,h,a])=>{
   const pooled=saucePhoto(accent,x,y,w*1.29,h*1.12,a);
   pooled.setAttribute('style','filter:none');
   pooled.setAttribute('opacity','.94');
   surface.append(pooled);
 });
 g.append(surface);
}
// Complementary halves share one organic seam in the base's own coordinates.
const chocolateSeams={
 's-waffle':'M208 -10 C206 38 218 78 212 101 S201 125 207 147 S220 176 213 194 S209 241 218 290',
 's-sheet':'M158 -10 C169 37 194 61 197 90 S203 113 212 131 S220 157 223 177 S243 239 260 290',
 's-bowl':'M202 -10 C203 35 218 58 215 76 S201 95 208 112 S225 141 219 156 S216 214 225 290'
};
function paintCoat(base,large,choice,half='full'){
 const frame=sceneFrames[base],path=coatPaths[base];
 const g=makeSvg('g',{'data-chocolate-base':chocolate[choice][0],'data-chocolate-half':half});
 if(!path)return g;
 if(large)g.setAttribute('transform','translate(210 145) scale(1.12) translate(-210 -145)');
 const colorLayer=makeSvg('g',{});
 if(half!=='full'){
   const id='chocolate-half-'+choice;
   const split=makeSvg('clipPath',{id,clipPathUnits:'userSpaceOnUse'});
   const edge=half==='left'?-30:450;
   // The seam runs top to bottom. Close the same path to opposite edges.
   split.append(makeSvg('path',{d:chocolateSeams[base]+' L'+edge+' 290 L'+edge+' -10 Z'}));
   g.append(split);
   colorLayer.setAttribute('clip-path','url(#'+id+')');
 }
 g.append(colorLayer);
 if(base==='s-bowl'){coatBowl(colorLayer,frame,choice);return g;}
 const cutId='chocolate-coat-cut-'+choice,filterId='chocolate-coat-photo-'+choice,glossId='chocolate-coat-gloss-'+choice;
 const defs=makeSvg('defs',{}),clip=makeSvg('clipPath',{id:cutId,clipPathUnits:'userSpaceOnUse'});
 clip.append(makeSvg('path',{d:path}));defs.append(clip);
 const f=makeSvg('filter',{id:filterId,x:'-2%',y:'-2%',width:'104%',height:'104%','color-interpolation-filters':'sRGB'});
 f.append(makeSvg('feGaussianBlur',{stdDeviation:1.25}));
 f.append(makeSvg('feColorMatrix',{type:'matrix',values:'0.34 0.53 0.13 0 0  0.34 0.53 0.13 0 0  0.34 0.53 0.13 0 0  0 0 0 1 0'}));
 const curves=makeSvg('feComponentTransfer',{});
 ['R','G','B'].forEach((channel,i)=>{
   const vals=coatPalette[choice].map(hex=>(parseInt(hex.slice(1+i*2,3+i*2),16)/255).toFixed(4));
   curves.append(makeSvg('feFunc'+channel,{type:'table',tableValues:vals.join(' ')}));
 });f.append(curves);defs.append(f);
 const gloss=makeSvg('linearGradient',{id:glossId,x1:'18%',y1:'13%',x2:'78%',y2:'85%'});
 [[0,.10],[.25,.02],[.36,.13],[.60,0],[1,.09]].forEach(([offset,a])=>gloss.append(makeSvg('stop',{offset,'stop-color':'#fff3df','stop-opacity':a})));defs.append(gloss);
 colorLayer.append(defs);
 const chocolateSurface=makeSvg('g',{'clip-path':'url(#'+cutId+')'});
 const photo=bitmap(frame.asset,frame.x,frame.y,frame.w,frame.h);
 photo.setAttribute('style','filter:url(#'+filterId+')');
 const shadow=makeSvg('path',{d:path,fill:coatPalette[choice][2],stroke:coatPalette[choice][1],'stroke-width':'.8'});
 const gleam=makeSvg('path',{d:path,fill:'url(#'+glossId+')',opacity:'.74'});
 const asset=photoByGroup.sauce[choice];
 const glaze=bitmap('well-'+asset,210,140,300,181);
 glaze.setAttribute('preserveAspectRatio','none');
 glaze.setAttribute('opacity','.66');
 photo.setAttribute('opacity','.65');
 chocolateSurface.append(shadow,glaze,photo,gleam);
 const spills=sauceFootprints[base]??[];
 for(const [n,[x,y,w,h,a]] of spills.entries()){
   const liquid=saucePhoto(asset,x,y,w*[1.45,1.25,1.29][n%3],h*[1.28,1.16,1.40][n%3],a+(n%3-1)*13,n%3===1?1:null);
   liquid.setAttribute('style','filter:drop-shadow(0 .58px .72px #31180944)');
   liquid.setAttribute('opacity',n%3===1?'.88':'.70');
   if(n%4===2)liquid.setAttribute('transform','translate('+(2*x)+' 0) scale(-1 1) rotate('+a+' '+x+' '+y+')');
   chocolateSurface.append(liquid);
 }
 colorLayer.append(chocolateSurface);
 return g;
}
function paintWell(group,asset,col,slot,frame){
 const [originalX,y,rx,ry]=frame.wells[slot];
 const x=originalX+2;
 group.setAttribute('data-well',String(slot+1));
 const centerY=y+.3, w=rx-1.25,h=ry-1.2;
 const edge=makeSvg('g',{transform:'rotate(11 '+x+' '+y+')'});
 const gradId='box-meniscus-'+slot;
 const depth=makeSvg('radialGradient',{id:gradId,cx:'52%',cy:'57%',rx:'60%',r:'59%'});
 [[0,'#421e16',0],[.71,'#421e16',0],[.92,'#421e16',.19],[1,'#421e16',.43]].forEach(([offset,col,alpha])=>depth.append(makeSvg('stop',{offset,'stop-color':col,'stop-opacity':alpha})));
 edge.append(depth);
 edge.append(makeSvg('ellipse',{cx:x,cy:centerY,rx:w-.15,ry:h-.05,fill:col,'data-sauce-liquid':''}));
 const surface=bitmap('dip-'+asset,x,centerY,w*2.02,h*2.02);
 surface.setAttribute('preserveAspectRatio','none');
 surface.setAttribute('style','filter:none');
 edge.append(surface,makeSvg('ellipse',{cx:x,cy:centerY,rx:w-.38,ry:h-.25,fill:'url(#'+gradId+')'}));
 edge.append(makeSvg('path',{d:`M ${x-w*.86} ${centerY+h*.26} Q ${x-1} ${centerY+h*1.41} ${x+w*.85} ${centerY+h*.27}`,fill:'none',stroke:'#ffdfcf','stroke-opacity':'.21','stroke-width':'.56'}));
 group.append(edge);
}
const packaging={
 's-bowl':{reference:'bowl-brand-empty',label:'Granny’s Bowl kabı',note:'Markanın orta ve büyük boy için kullandığı orijinal kap fotoğrafı. Boyut farkı demoda görsel olarak canlandırılır.'},
 's-sheet':{reference:'package-brussels-official',label:'Brüksel Waffle',note:'Canlı önizlemede seçim kartındaki tabak sunumu; burada markanın paket kutusu gösterilir.'},
 's-box':{reference:'base-box-wells',label:'Granny’s Box kutusu',note:'Markanın 2 kişilik kutu referansı.'},
 's-potato':{reference:'package-kumpir-official',label:'Pembe servis kutusu · siyah tepsi',note:'Önizleme, gönderdiğin menüdeki servis sunumuna dayanır. Buradaki fotoğraf ise markanın paket kutusudur.'}
};
function portionPlans(state,baseId){
 if(baseId==='s-box'){
   const p={};
   for(const side of [0,1]){
     const zone=side?'s-box-right':'s-box-left';
     const indices=(state.picks.fruit??[]).filter(i=>(i<2?0:1)===side).sort();
     const groups=portions.makeBoxMix(zone,indices.map(i=>photoByGroup.fruit[i]));
     for(const i of indices)p['fruit:'+i]={zone,points:groups[photoByGroup.fruit[i]]};
   }
   return p;
 }
 const id=baseId==='s-bowl'&&state.base===3?'s-bowl-large':baseId;
 const plans=state.placements[id]??(state.placements[id]={});
 for(const [key,i] of state.order){
   if(key==='sauce'||(baseId==='s-bowl'&&key==='fruit')||(key==='special'&&i<2)||(key==='topping'&&i<6)||(key==='savoury'&&i===4))continue;
   const k=key+':'+i;
   if(plans[k])continue;
   const zone=baseId==='s-box'?(i<2?'s-box-left':'s-box-right'):id;
   const occupied=Object.values(plans).filter(z=>z.zone===zone).flatMap(z=>z.points);
   plans[k]={zone,points:key==='special'?specialPieces(baseId,baseId==='s-bowl'&&state.base===3,i):portions.makePlan(zone,photoByGroup[key][i],occupied)};
 }
 return plans;
}
// Pixels from Granny's menu photographs, clipped to the named ingredient only.
const sourceFragments={
 'oreo':[
  ['magnolia',807,148,68,74,'M814 151L840 161L860 180L873 204L858 214L839 199L828 181L816 166Z'],
  ['magnolia',777,190,92,61,'M784 196Q807 204 818 210L838 207L860 218L849 230L830 238L805 246L780 239L786 222Z'],
  ['magnolia',844,209,70,55,'M851 214L868 210L891 218L908 236L898 257L876 259L851 248L845 235Z']
 ],
 'lotus':[
  ['magnolia',612,363,136,123,'M625 395L642 389L650 376L671 374L687 367L707 372L727 366L736 382L735 403L744 425L729 441L718 459L695 464L677 475L656 468L621 456L615 440L624 421Z'],
  ['magnolia',735,438,140,76,'M744 451L775 454L795 451L813 459L845 453L866 462L859 478L839 489L818 498L792 507L770 502L749 493L737 476Z']
 ],
 'brownie':[
  ['brownie',428,297,146,128,'M435 335L457 325L477 325L492 307L522 303L539 313L565 328L559 352L568 378L550 406L525 417L498 406L475 413L453 400L435 374Z'],
  ['brownie',563,375,148,132,'M565 423L599 407L621 386L642 380L655 395L673 397L698 415L706 439L689 465L662 479L650 498L621 501L597 478L578 462Z'],
  ['magnolia',449,332,132,84,'M455 369L466 351L494 346L507 335L532 342L552 351L574 348L568 377L552 397L522 412L489 406L472 393L453 388Z']
 ]
};
let sourceSerial=0;
function sourceFood(asset,variant,x,y,w,h,a){
 const repertoire=sourceFragments[asset], [photo,sx,sy,sw,sh,trace]=repertoire[variant%repertoire.length];
 const id='source-food-'+sourceSerial++;
 const svg=makeSvg('svg',{x:x-w/2,y:y-h/2,width:w,height:h,viewBox:[sx,sy,sw,sh].join(' '),preserveAspectRatio:'none',transform:'rotate('+a+' '+x+' '+y+')','data-original-texture':asset, style:'filter:drop-shadow(0 .8px .9px #4221116a)'});
 const mask=makeSvg('clipPath',{id,clipPathUnits:'userSpaceOnUse'});
 mask.append(makeSvg('path',{d:trace}));svg.append(mask);
 svg.append(makeSvg('image',{href:'/assets/v34/source-'+photo+'.jpg',x:0,y:0,width:1250,height:750,'clip-path':'url(#'+id+')'}));
 return svg;
}
function renderPortion(group,asset,pts,kind){
 for(const pt of [...pts].sort((a,b)=>a.y-b.y)){
   const fruit=pt.variant!==undefined;
   const alternate=Math.abs(Math.round(pt.x+pt.y))%2;
   const content=kind==='savoury'?'kumpir-'+asset+'-'+alternate:fruit?'fruit-'+asset+'-'+pt.variant:kind==='special'?'finish-'+asset+'-'+alternate:asset==='haribo'?'bear-'+alternate:photographSprite(asset);
   const k=asset==='haribo'?.69:1;
   const img=kind==='special'&&asset==='brownie'?sourceFood(asset,alternate+Math.floor(pt.x%3),pt.x,pt.y,pt.size*1.12,pt.size*.84,pt.angle*.55):bitmap(content,pt.x,pt.y,pt.size*k,pt.size*k,pt.angle);
   img.setAttribute('style',fruit?'filter:brightness('+pt.tone+') drop-shadow(0 1.2px .95px #4b241b83)':'filter:brightness('+pt.tone+') drop-shadow(0 .85px 1.1px #4b241b65)');
   if(fruit){
     img.setAttribute('data-fruit-cut',String(pt.variant));
     group.append(makeSvg('ellipse',{cx:pt.x+.5,cy:pt.y+pt.size*.22,rx:pt.size*.31,ry:pt.size*.12,fill:'#66293a',opacity:'.15',transform:'rotate('+Math.round(pt.angle/3)+' '+pt.x+' '+pt.y+')'}));
   }
   group.append(img);
 }
}
const crushed=['oreo','coconut','peanut','lotus','hazelnut','walnut'];
// Four edge-to-edge sweeps. The oval, rectangle and bowl use separate maps.
const creamPaths={
 's-waffle':[
  [[139,139,74,34,-17],[207,116,84,38,10],[265,144,74,30,-13],[208,178,72,30,15]],
  [[157,167,79,36,9],[202,99,67,33,-11],[253,130,75,34,-5],[262,173,66,32,-16]]
 ],
 's-sheet':[
  [[128,113,72,33,-16],[198,116,87,38,-15],[263,106,69,34,-12],[232,162,79,34,-15]],
  [[154,161,73,34,-8],[189,89,74,32,-17],[234,129,76,35,-11],[294,140,66,31,-17]]
 ],
 's-bowl':[
  [[150,94,58,36,-15],[198,84,68,37,19],[248,92,66,36,-11],[222,126,60,34,12]],
  [[172,110,67,34,8],[216,66,63,34,-10],[257,105,64,37,11],[238,129,59,32,-14]]
 ]
};
const solidSpecialPaths={
 's-waffle':[[142,124],[210,94],[270,125],[168,168],[245,177],[207,144],[299,151]],
 's-sheet':[[124,116],[190,97],[257,101],[147,155],[242,160],[203,134],[289,135]],
 's-bowl':[[146,93],[200,72],[254,87],[167,122],[244,122],[205,105],[281,104]]
};
function specialPieces(baseId,large,choice){
 const coords=solidSpecialPaths[baseId];
 const order=choice===2?[0,2,4,5,3,6,1]:[1,3,6,4,0,5,2];
 return order.map((slot,n)=>{
   let [x,y]=coords[slot]; x+=(choice===2?-3:3); y+=n%2?4:-4;
   if(large){x=210+(x-210)*1.12;y=145+(y-145)*1.12;}
   return {x,y,size:[25,26,21,24,21,23,19][n]*(large?1.12:1)*(baseId==='s-bowl'?[.81,1,.79,.91,.72,.88,.77][n]:1),angle:[-17,22,11,-27,34,-6,37][n],tone:1};
 });
}
function plateCream(layers,baseId,large,choice){
 const group=makeSvg('g',{'data-special':specials[choice][0],'data-serving-layer':'cream-on-top'});
 if(large)group.setAttribute('transform','translate(210 145) scale(1.12) translate(-210 -145)');
 const asset=photoByGroup.special[choice];
 if(baseId==='s-bowl'){
   // Use the gloss and shading baked into the cream cutouts, not a solid ribbon.
   const ribbons=[
     [[176,67,35,22,-34,0],[241,85,43,20,-26,0],[156,127,30,20,17,1],[214,142,43,23,-13,0],[270,122,33,18,16,0]],
     [[214,57,33,23,21,1],[147,107,34,19,-14,0],[192,114,42,21,-21,0],[249,130,36,24,21,1],[203,150,35,17,8,0],[275,110,26,20,21,0]]
   ];
   ribbons[choice].forEach(([x,y,w,h,a,variant],i)=>{
     const finish=bitmap('finish-'+asset+'-'+variant,x,y,w*.87,h*.81,a);
     finish.setAttribute('preserveAspectRatio','none');
     finish.setAttribute('data-special-portion',i+1);
     finish.setAttribute('style','filter:drop-shadow(0 .65px .56px #4d26195c)');
     if(i===1||i===3)finish.setAttribute('transform','translate('+2*x+' 0) scale(-1 1) rotate('+(-a)+' '+x+' '+y+')');
     group.append(finish);
   });
   layers.append(group);return;
 }
 creamPaths[baseId][choice].forEach(([x,y,w,h,a],i)=>{
   const img=bitmap('finish-'+asset+'-'+(i%3===0?1:0),x,y,w*[.88,.80,.80,.72][i],h*[1.06,.91,.98,.83][i],a);
   img.setAttribute('style','filter:drop-shadow(0 .73px .84px #45251860)');
   img.setAttribute('data-special-portion',i+1);
   group.append(img);
 });
 layers.append(group);
}
const garnishFields={
 's-waffle':[210,145,236,142],'s-sheet':[207,136,226,125],'s-bowl':[213,105,194,96]
};
const garnishPlacements={
 's-waffle':[[145,105],[211,91],[274,111],[112,146],[161,134],[212,127],[267,143],[304,147],[132,181],[176,183],[228,173],[278,182],[206,200]],
 's-sheet':[[102,104],[164,91],[224,82],[271,79],[116,135],[170,120],[222,112],[287,109],[134,164],[183,155],[241,143],[313,139],[177,182],[246,168]],
 's-bowl':[[157,88],[196,72],[248,81],[133,111],[174,98],[215,89],[259,98],[283,110],[155,128],[184,132],[229,122],[268,137],[214,148],[239,146]]
};
function plateGarnish(top,baseId,ids){
 const spots=garnishPlacements[baseId],profile=portions.profiles[baseId];
 const slots=[0,2,8,11,4,6,1,9,7,12,3,10,5,13].filter(i=>i<spots.length);
 for(const id of ids){
   const name=photoByGroup.topping[id];
   if(!crushed.includes(name))continue;
   const group=makeSvg('g',{'data-garnish':name,'data-garnish-style':'distributed'});
   const count=ids.length===1?16:13;
   for(let i=0;i<count;i++){
     const [cx,cy]=spots[slots[(i+id*3)%slots.length]];
     const angle=(id*118+i*133+35)%360,r=i>=slots.length?10:[4,8,11,5,8,13][(i+id)%6];
     let x=cx+Math.cos(angle*Math.PI/180)*r,y=cy+Math.sin(angle*Math.PI/180)*r*.66;
     if(!portions.within(x,y,profile.area)){x=cx;y=cy;}
     const variant=(i*3+id)%4;
     const w=[13,17,12,18,13,16,11,14,17,12,15,11][(i+2*id)%12]*(baseId==='s-bowl'?(i%4===0?.94:.76):1);
     const item=bitmap('crumb-'+name+'-'+variant,x,y,w,w*(name==='coconut'?.69:.86),(i*97+id*21)%132-66);
     item.setAttribute('style','filter:drop-shadow(0 .47px .56px #36201583)');
     item.setAttribute('data-garnish-bit',String(variant));
     group.append(item);
   }
   top.append(group);
 }
}
function dressPlate(baseId,large,state){
 const garnish=(state.picks.topping??[]).filter(i=>i<6);
 const top=makeSvg('g',{'data-plate-finish':'photo'});
 if(large)top.setAttribute('transform','translate(210 145) scale(1.12) translate(-210 -145)');
 if(!garnishFields[baseId])return top;
 plateGarnish(top,baseId,garnish);
 return top;
}
// This curved bed is bowl-specific: upright pieces at the back, overlapping slices
// in the center and a final foreground row tucked just behind the package rim.
const bowlFruitSeats=[
 [169,64,41,-31],[213,55,40,25],[251,65,42,23],
 [138,107,32,-26],[185,96,33,-18],[223,90,32,34],[271,103,34,-29],
 [148,132,39,16],[192,121,37,-21],[234,113,39,-37],[291,121,37,22],
 [167,145,40,-16],[204,154,41,23],[245,150,39,12],[272,133,37,-17],
 [151,95,27,15],[233,73,27,-19],[253,96,30,-17],[174,108,28,31],
 [211,112,32,18],[188,143,34,-38],[228,154,37,-22],[262,143,33,32],[297,106,31,-13],
 [143,109,31,-30],[194,75,36,34],[228,62,34,-28],[277,109,35,13],
 [121,111,34,-18],[134,126,36,23],[157,140,36,-18],[181,151,38,14],
 [206,159,35,-21],[229,157,40,19],[252,148,40,-20],[279,143,35,14],
 [295,131,34,-17],[305,111,32,19],[278,76,36,-22],[146,78,34,27],
 [190,55,37,-26],[228,51,36,23],[257,52,34,16],[265,110,41,-18]
];
// A continuous photographic mound keeps the joint shadows and depth under
// every selection. The exact branded package remains the independent base.
function bowlWaffleMound(state,large){
 if(!state.order.length)return null;
 const sauces=state.picks.sauce??[];
 const mound=makeSvg('g',{'data-bowl-mound':'continuous'});
 if(large)mound.setAttribute('transform','translate(210 145) scale(1.12) translate(-210 -145)');
 const crust=makeSvg('clipPath',{id:'bowl-surface-alpha',clipPathUnits:'userSpaceOnUse'});
 const border='M95 115Q91 94 116 74Q130 63 144 49Q164 19 197 27Q218 17 252 29Q270 27 286 52Q316 70 326 105Q332 122 312 145Q270 177 212 175Q149 175 111 143Q98 133 95 115Z';
 crust.append(makeSvg('path',{d:border}));mound.append(crust);
 const pile=()=>{const photo=bitmap('scene-bowl-continued-waffle',210,101,233,155);photo.setAttribute('preserveAspectRatio','none');return photo;};
 mound.append(pile());
 const seats=[[119,105,40,21,12],[143,80,51,32,-21],[177,64,48,34,26],[187,101,54,32,-8],[146,130,53,27,19],[198,150,59,30,-14],[221,80,50,28,-31],[265,63,51,37,28],[289,98,47,25,-16],[262,125,55,34,20],[294,132,42,26,-10],[238,151,58,27,7],[319,115,31,20,20]];
 sauces.forEach((choice,i)=>{
   const key=photoByGroup.sauce[choice], side=sauces.length===1?'full':i===0?'left':'right';
   const coat=makeSvg('g',{'data-chocolate-base':chocolate[choice][0],'data-chocolate-half':side});
   if(side!=='full'){
     const id='mound-sauce-half-'+i,edge=i===0?-30:450;
     const split=makeSvg('clipPath',{id,clipPathUnits:'userSpaceOnUse'});
     split.append(makeSvg('path',{d:chocolateSeams['s-bowl']+' L'+edge+' 290 L'+edge+' -10 Z'}));
     mound.append(split);coat.setAttribute('clip-path','url(#'+id+')');
   }
   const film=makeSvg('g',{'clip-path':'url(#bowl-surface-alpha)'});
   const alpha=makeSvg('mask',{id:'mound-alpha-'+i,maskUnits:'userSpaceOnUse',x:90,y:20,width:245,height:160,style:'mask-type:alpha'});
   alpha.append(pile());mound.append(alpha);film.setAttribute('mask','url(#mound-alpha-'+i+')');
   seats.forEach(([x,y,w,h,a],j)=>{
     if(side==='left'&&x>229||side==='right'&&x<177)return;
     const image=saucePhoto(key,x,y,w,h,a,j%3===0?1:null);
     image.setAttribute('opacity',j%3===0?'.77':'.86');
     image.setAttribute('style','filter:drop-shadow(0 .65px .62px #44241654)');
     film.append(image);
   });
   coat.append(film);mound.append(coat);
 });
 return mound;
}
function finishPlatedFruit(group,baseId,state,asset,pt,index){
 const choices=state.picks.sauce??[];
 if(!choices.length||index%4===2||pt.variant===undefined)return;
 const {x,y,size,angle,variant}=pt;
 const mid=baseId==='s-sheet'?209+(y-132)*.36:211;
 const flavor=choices[choices.length===2&&x>mid?1:0];
 const id='plate-fruit-gloss-'+index;
 const mask=makeSvg('mask',{id,maskUnits:'userSpaceOnUse',x:x-size,y:y-size,width:size*2,height:size*2,style:'mask-type:alpha'});
 mask.append(bitmap('fruit-'+asset+'-'+variant,x,y,size,size,angle));
 const layer=makeSvg('g',{'mask':'url(#'+id+')','data-fruit-gloss':chocolate[flavor][0]});
 const drip=saucePhoto(photoByGroup.sauce[flavor],x+(index%2?2:-3),y-3,size*.85,size*.43,angle+(index%2?35:-23),1);
 drip.setAttribute('opacity',index%4===0?'.82':'.62');
 drip.setAttribute('style','filter:drop-shadow(0 .55px .62px #46241966)');
 layer.append(drip);group.append(mask,layer);
}
function buildBowlFruit(large,product,state){
 const picks=state.picks.fruit??[];
 if(!picks.length)return null;
 const layer=makeSvg('g',{'data-serving':'bowl-depth'});
 if(large)layer.setAttribute('transform','translate(210 145) scale(1.12) translate(-210 -145)');
 const map=[22,31,38,42], total=map[picks.length-1]-(large?0:3);
 const preference=[0,2,3,6,7,10,28,29,30,31,32,33,34,35,36,37,38,39,1,4,8,9,12,13,15,16,17,18,19,20,21,22,23,25,26,27,40,41,42,43,5,11];
 // Rotate which fruit leads each cluster without hiding less frequent selections.
 const choices=preference.slice(0,total).map((slot,i)=>({slot,which:picks[(i+Math.floor(i/picks.length))%picks.length]}));
 choices.sort((a,b)=>bowlFruitSeats[a.slot][1]-bowlFruitSeats[b.slot][1]);
 choices.forEach(({slot,which})=>{
   const [x,y,size,angle]=bowlFruitSeats[slot];
   const g=makeSvg('g',{'data-bowl-fruit':product.steps.find(q=>q.key==='fruit').items[which][0]});
   if(fresh==='fruit:'+which)g.setAttribute('class','fall');
   const scale=size*(which===3?.91:1)*([1,7,10,11,13,33].includes(slot)?1.02:.88);
   const variant=[1,0,2,1,2,0,1][slot%7], fruitAsset=photoByGroup.fruit[which];
   renderPortion(g,fruitAsset,[{x,y,size:scale,angle,tone:y>129?.97:1,variant}],'fruit');
   const sauces=state.picks.sauce??[];
   if(sauces.length&&slot%4!==1){
     const choice=sauces[sauces.length===2&&x>213?1:0],asset=photoByGroup.sauce[choice];
     const id='bowl-fruit-contact-'+slot;
     const mask=makeSvg('mask',{id,maskUnits:'userSpaceOnUse',x:x-scale,y:y-scale,width:scale*2,height:scale*2,style:'mask-type:alpha'});
     mask.append(bitmap('fruit-'+fruitAsset+'-'+variant,x,y,scale,scale,angle));g.append(mask);
     const contact=makeSvg('g',{'mask':'url(#'+id+')','data-sauce-contact':chocolate[choice][0]});
     const drip=saucePhoto(asset,x+(slot%2?3:-3),y+(slot%3-1)*4,scale*.80,scale*.37,angle+(slot%2?39:-23),1);
     drip.setAttribute('opacity',slot%3===0?'.78':'.57');
     drip.setAttribute('style','filter:drop-shadow(0 .55px .52px #4c270d68)');
     contact.append(drip);g.append(contact);
   }
   layer.append(g);
 });
 return layer;
}
function renderLayers(product,state){
 sourceSerial=0;
 const [base,baseId]=product.base[state.base];
 const frame=sceneFrames[baseId];
 const isBowl=baseId==='s-bowl', isLargeBowl=isBowl&&state.base===3;
 const scale=isLargeBowl?1.12:1;
 const bare=bitmap(frame.asset,frame.x,frame.y,frame.w*scale,frame.h*scale);
 bare.setAttribute('class','scene-photo');
 bare.setAttribute('data-scene-base',baseId);
 const b=baseNode; b.replaceChildren(bare);
 // Keep the white front rim in front while allowing a real mound to overlap the rear rim.
 const hasBowlMound=isBowl&&state.order.length>0;
 const crop=hasBowlMound?{...frame,clip:'M94 102Q92 84 121 64Q137 46 153 33Q168 16 197 21Q222 10 245 21Q272 18 287 45Q311 68 323 89Q335 104 322 130Q316 140 305 146Q286 162 258 168Q232 177 199 174Q167 172 142 160Q113 149 101 132Z'}:frame;
 const clip=edibleClip(crop,isLargeBowl);if(clip)b.append(clip);
 const layers=layersNode;layers.replaceChildren();layers.removeAttribute('transform');
 if(clip)layers.setAttribute('clip-path','url(#edible-scene)');else layers.removeAttribute('clip-path');
 const plans=portionPlans(state,baseId);
 const rank=key=>key==='sauce'?0:key==='fruit'?1:2;
 const visualOrder=[...state.order].sort((a,b)=>rank(...a)-rank(...b));
 const stack=[], specialStack=[], boxStack={};
 visualOrder.forEach(([key,i])=>{
  const step=product.steps.find(x=>x.key===key), [name,id,col]=step.items[i];
  const own=state.picks[key].indexOf(i), asset=photoByGroup[key][i], g=makeSvg('g',{'data-ingredient':name});
  const group=makeSvg('g',{});if(fresh===key+':'+i&&(key!=='sauce'||active==='box'))group.setAttribute('class','fall');g.append(group);
  if(active==='box'){
   if(key==='sauce'){
     paintWell(group,asset,col,state.sauceWells[i],frame);
   }else{
     const plan=plans[key+':'+i];
     (boxStack[plan.zone]??=[]).push(...plan.points.map(pt=>({pt,asset,name,fresh:fresh===key+':'+i})));
   }
  }else if(key==='savoury'&&i===4){
   // Melted kaşar is applied after the other ingredients.
  }else if(key==='special'&&i<2){
   // Cream is painted above the fruit and garnish below.
  }else if(isBowl&&key==='fruit'){
   // Fruit uses the curved Bowl bed below, not the flat scattered layout.
  }else if(key==='special'){
   for(const pt of plans[key+':'+i].points)specialStack.push({pt,asset,name});
  }else if(id==='drizzle'){
   if(!isBowl){
     const split=state.picks.sauce.length===2;
     group.append(paintCoat(baseId,isLargeBowl,i,split?(own===0?'left':'right'):'full'));
   }
  }else if(key==='topping'&&crushed.includes(asset)){
   // Ground ingredients use an irregular photo scatter above the fruit.
  }else if(isBowl||baseId==='s-waffle'||baseId==='s-sheet'||baseId==='s-potato'){
   for(const pt of plans[key+':'+i].points)stack.push({pt,asset,name,fresh:fresh===key+':'+i,key});
  }else renderPortion(group,asset,plans[key+':'+i].points);
  layers.append(g);
 });
 for(const [zone,pieces] of Object.entries(boxStack)){
   const bay=makeSvg('g',{'data-box-fruit':zone});
   const left=zone==='s-box-left';
   const names=[...new Set(pieces.map(p=>p.asset))].sort();
   const key=names.join('-');
   const variants={'banana-strawberry':'strawberry-banana','kiwi-pineapple':'kiwi-pineapple'};
   const asset='box-fruit-'+(variants[key]??key);
   const limit='fruit-compartment-'+(left?'left':'right');
   const edge=makeSvg('clipPath',{id:limit,clipPathUnits:'userSpaceOnUse'});
   edge.append(makeSvg('path',{d:left?'M148 63L204 16L292 41L245 87Z':'M248 87L297 43L389 65L345 113Z'}));
   bay.append(edge);
   const full=makeSvg('g',{'clip-path':'url(#'+limit+')'});
   const rows=left?[[223,34,104,39,12],[216,48,126,52,12],[202,66,106,37,13]]:[[322,60,104,42,13],[317,76,125,52,14],[300,92,106,38,14]];
   rows.forEach(([x,y,w,h,a],i)=>{
     const portion=bitmap(asset,x,y,w,h,a);
     portion.setAttribute('preserveAspectRatio','none');
     portion.setAttribute('data-box-fruit-row',['back','middle','front'][i]);
     portion.setAttribute('style',i?'filter:drop-shadow(0 1.25px 1.1px #71384572)':'filter:brightness(.94) drop-shadow(0 .7px .85px #71384565)');
     if(i===0)portion.setAttribute('transform','translate('+(2*x)+' 0) scale(-1 1) rotate('+(-a)+' '+x+' '+y+')');
     full.append(portion);
   });
   // Follow the near wall of each fruit compartment instead of leaving bare corners.
   const lip=makeSvg('g',{'data-box-front-fill':left?'left':'right'});
   const front=left?[[160,61,16,-19],[175,65,23,12],[195,70,20,-18],[216,76,23,21],[235,80,19,-12]]
                  :[[261,85,17,-13],[276,89,22,18],[295,94,23,-18],[316,100,22,14],[336,105,19,-12]];
   front.forEach(([x,y,size,angle],i)=>{
     renderPortion(lip,names[(i+(left?1:0))%names.length],[{x,y,size,angle,variant:[1,0,2,1,2][i],tone:1}],'fruit');
   });
   full.append(lip);
   bay.append(full);
   for(const title of [...new Set(pieces.map(p=>p.name))])bay.append(makeSvg('g',{'data-box-piece':title}));
   layers.append(bay);
 }
 if(isBowl){const mound=bowlWaffleMound(state,isLargeBowl);if(mound)layers.append(mound);}
 if(stack.length){
  const front=makeSvg('g',{'data-scene-depth':'mixed'});
  stack.sort((a,b)=>(a.pt.y+(a.key==='topping'?8:0))-(b.pt.y+(b.key==='topping'?8:0)));
  for(const [index,{pt,asset,name,fresh,key}] of stack.entries()){
    const g=makeSvg('g',{'data-scene-piece':name});
    if(fresh)g.setAttribute('class','fall');
    renderPortion(g,asset,[pt],key);
    if(key==='fruit'&&(baseId==='s-sheet'||baseId==='s-waffle'))finishPlatedFruit(g,baseId,state,asset,pt,index);
    front.append(g);
  }
  layers.append(front);
 }
 if(isBowl){
   const fruit=buildBowlFruit(isLargeBowl,product,state);
   if(fruit)layers.append(fruit);
 }
 if(active==='kumpir'&&state.picks.savoury?.includes(4)){
   const cheese=makeSvg('g',{'data-kumpir-cheese':'melted'});
   [[181,123,63,31,-19],[225,100,69,34,-15],[265,76,57,30,-19]].forEach(([x,y,w,h,a],i)=>{
      const img=bitmap('kumpir-cheese-'+i%2,x,y,w,h,a);
      img.setAttribute('style','filter:drop-shadow(0 .95px .85px #6b47235a)');
      cheese.append(img);
   });
   layers.append(cheese);
 }
 if(active==='waffle'){
   layers.append(dressPlate(baseId,isLargeBowl,state));
   if(state.picks.special?.length){
     const top=makeSvg('g',{'data-special-layer':'top'});
     for(const id of state.picks.special)if(id<2)plateCream(top,baseId,isLargeBowl,id);
     for(const {pt,asset,name} of specialStack.sort((a,b)=>a.pt.y-b.pt.y)){
       const g=makeSvg('g',{'data-special-piece':name});
       renderPortion(g,asset,[pt],'special');top.append(g);
     }
     layers.append(top);
   }
 }
}

 const baseNode=makeSvg('g',{'data-engine-base':''}),layersNode=makeSvg('g',{'data-engine-layers':''});
 svg.replaceChildren(baseNode,layersNode);
 const state={base:0,step:0,picks:{},order:[],sauceWells:{},placements:{}};
 let active='waffle',fresh=null;
 return {render(input){
   active=input.category==='box'?'box':'waffle';
   const base=input.selections.base?.[0]??'';
   state.base=input.category==='bowl'?(base==='waffle-bowl-large'?3:2):input.category==='waffle'&&base.includes('brussels')?1:0;
   const maps={sauce:['milk','white','dark','hazelnut-chocolate','strawberry-chocolate','pistachio','caramel','raspberry'],fruit:['strawberry','banana','kiwi','pineapple'],topping:['oreo','coconut','peanut','lotus','hazelnut','walnut','haribo'],special:['milk-jam','magnolia','chestnut','brownie']};
   const picks={};
   for(const [key,ids] of Object.entries(maps))picks[key]=(input.selections[key==='sauce'?'chocolate':key]??[]).map(id=>ids.indexOf(id)).filter(i=>i>=0);
   if(active==='box')picks.special=[];
   const next=Object.entries(picks).flatMap(([key,indices])=>indices.map(i=>[key,i]));
   const previous=new Set(state.order.map(([k,i])=>k+':'+i));
   const additions=next.filter(([k,i])=>!previous.has(k+':'+i));
   fresh=additions.length===1?additions[0].join(':'):null;
   const selected=new Set(next.map(([k,i])=>k+':'+i));
   for(const plans of Object.values(state.placements))for(const key of Object.keys(plans))if(!selected.has(key))delete plans[key];
   state.picks=picks;state.order=next;
   state.sauceWells={};
   const used=new Set();
   for(const i of picks.sauce){const id=maps.sauce[i],slot=input.sauceWells?.[id];if((slot===0||slot===1)&&!used.has(slot)){state.sauceWells[i]=slot;used.add(slot);}}
   for(const i of picks.sauce)if(state.sauceWells[i]===undefined){const slot=used.has(0)?1:0;state.sauceWells[i]=slot;used.add(slot);}
   const product=active==='box'?{...products.box,steps:[...products.box.steps,group('topping','Süsleme',toppings)]}:products.waffle;
   renderLayers(product,state);
   svg.setAttribute('data-engine-version',active==='box'?'v15':'v34');
 }};
}
