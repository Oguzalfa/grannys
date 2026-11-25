// @ts-nocheck
// Reviewed rendering primitives copied from the user-supplied Grannys engine.
// Source and bounded adapter changes are recorded in refs/sauce-algorithm-provenance.md.
import type { V34Engine } from './v34-types'
export function createV15BoxEngine(svg: SVGSVGElement, prefix: string): V34Engine {
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
  's-bowl':{area:[[106,96],[123,73],[164,55],[217,52],[263,60],[298,78],[314,99],[291,123],[261,139],[219,151],[181,146],[145,132],[116,115]],scale:1.16,fill:1.25},
  's-bowl-large':{area:[[94,90],[113,64],[158,44],[218,41],[270,50],[309,70],[327,93],[301,120],[267,138],[220,152],[178,146],[137,130],[105,111]],scale:1.27,fill:1.38},
  's-potato':{area:[[105,147],[113,125],[142,101],[178,78],[224,58],[267,50],[302,52],[317,73],[308,89],[270,111],[226,130],[184,149],[138,163],[111,160]],scale:1.21,fill:1.20},
  's-box-left':{area:[[153,65],[202,37],[280,52],[232,82]],scale:.80,fill:1.24},
  's-box-right':{area:[[246,93],[290,64],[369,80],[322,114]],scale:.80,fill:1.24}
 };
 const recipe={
  strawberry:[7,33,45],banana:[8,30,54],kiwi:[6,35,38],pineapple:[8,28,66],
  oreo:[7,23,72],coconut:[8,22,80],peanut:[7,23,80],lotus:[7,22,80],hazelnut:[7,23,74],walnut:[7,24,65],haribo:[5,21,65],
  chestnut:[4,28,74],brownie:[4,28,54],
  corn:[10,22,90],pickle:[7,28,64],olive:[9,21,86],carrot:[9,25,70],cheese:[11,29,86]
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
  const total=Math.round(amount*(profile.fill??(isBox?.75:1)));
  const bowl=profileName.startsWith('s-bowl');
  const R=rand(seed(profileName+'_'+ingredient)),points=[];
  for(let ix=0;ix<total;ix++){
   let piece=(.81+R()*.30)*size*profile.scale*(fruit?(plated?1.02:.94):1);
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
 return makeSvg('image',{href:'/assets/v15/'+name+'.webp',x:x-w/2,y:y-h/2,width:w,height:h,transform:angle?'rotate('+angle+' '+x+' '+y+')':'',preserveAspectRatio:'xMidYMid meet',class:'food-photo'});
}
// A composition is anchored to the same photograph for every selection.
const sceneFrames={
 's-waffle':{asset:'scene-papatya-base',x:210,y:145,w:359,h:219,clip:'M80 147Q82 119 103 110Q100 86 130 82Q137 59 173 67Q196 53 219 64Q252 56 263 71Q296 70 304 90Q322 96 324 118Q342 128 341 148Q344 171 322 179Q318 201 288 203Q266 224 239 221Q215 230 189 219Q158 225 141 211Q106 213 98 188Q77 179 80 147Z'},
 's-sheet':{asset:'scene-brussels-base',x:210,y:145,w:356,h:237,clip:'M65 106Q64 94 81 90L274 56Q285 53 291 67L344 156Q351 170 337 177L124 215Q105 221 99 201Z'},
 's-bowl':{asset:'scene-bowl-base',x:210,y:145,w:247,h:241,clip:'M99 102Q105 77 131 61Q151 40 178 40Q190 30 222 34Q247 37 259 46Q288 49 306 70Q319 83 322 103Q312 124 285 140Q253 153 211 155Q168 152 140 136Q111 122 99 102Z'},
 's-potato':{asset:'scene-kumpir-base',x:210,y:147,w:367,h:232,clip:'M98 151Q93 133 112 115Q141 74 191 58Q233 38 280 40Q308 43 322 60Q333 79 320 94Q302 113 267 124Q215 147 165 165Q113 182 98 151Z'},
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
function paintCoat(base,large,choice){
 const frame=sceneFrames[base],path=coatPaths[base];
 const g=makeSvg('g',{'data-chocolate-base':chocolate[choice][0]});
 if(!path)return g;
 if(large)g.setAttribute('transform','translate(210 145) scale(1.12) translate(-210 -145)');
 if(base==='s-bowl'){
   const asset=photoByGroup.sauce[choice];
   const pieces=[[139,91,52,26,-14],[170,72,42,27,25],[207,61,43,28,23],[223,95,58,35,13],[266,83,53,28,-5],[289,109,45,30,12],[253,124,62,30,-11],[185,119,64,31,12],[140,115,39,22,-13],[218,136,51,25,2]];
   pieces.forEach(([x,y,w,h,a],n)=>g.append(saucePhoto(asset,x,y,w,h,a,n%3===0?0:1)));
   return g;
 }
 const defs=makeSvg('defs',{}),clip=makeSvg('clipPath',{id:'chocolate-coat-cut',clipPathUnits:'userSpaceOnUse'});
 clip.append(makeSvg('path',{d:path}));defs.append(clip);
 const f=makeSvg('filter',{id:'chocolate-coat-photo',x:'-2%',y:'-2%',width:'104%',height:'104%','color-interpolation-filters':'sRGB'});
 f.append(makeSvg('feGaussianBlur',{stdDeviation:.74}));
 f.append(makeSvg('feColorMatrix',{type:'matrix',values:'0.34 0.53 0.13 0 0  0.34 0.53 0.13 0 0  0.34 0.53 0.13 0 0  0 0 0 1 0'}));
 const curves=makeSvg('feComponentTransfer',{});
 ['R','G','B'].forEach((channel,i)=>{
   const vals=coatPalette[choice].map(hex=>(parseInt(hex.slice(1+i*2,3+i*2),16)/255).toFixed(4));
   curves.append(makeSvg('feFunc'+channel,{type:'table',tableValues:vals.join(' ')}));
 });f.append(curves);defs.append(f);
 const gloss=makeSvg('linearGradient',{id:'chocolate-coat-gloss',x1:'18%',y1:'13%',x2:'78%',y2:'85%'});
 [[0,.10],[.25,.02],[.36,.13],[.60,0],[1,.09]].forEach(([offset,a])=>gloss.append(makeSvg('stop',{offset,'stop-color':'#fff3df','stop-opacity':a})));defs.append(gloss);
 g.append(defs);
 const chocolateSurface=makeSvg('g',{'clip-path':'url(#chocolate-coat-cut)'});
 const photo=bitmap(frame.asset,frame.x,frame.y,frame.w,frame.h);
 photo.setAttribute('style','filter:url(#chocolate-coat-photo)');
 const shadow=makeSvg('path',{d:path,fill:coatPalette[choice][2],stroke:coatPalette[choice][1],'stroke-width':'.8'});
 const gleam=makeSvg('path',{d:path,fill:'url(#chocolate-coat-gloss)',opacity:'.74'});
 chocolateSurface.append(shadow,photo,gleam);
 const spills=sauceFootprints[base]??[];
 for(const [n,[x,y,w,h,a]] of spills.entries()){
   if(![1,2,4,6].includes(n))continue;
   const liquid=saucePhoto(photoByGroup.sauce[choice],x,y,w*1.29,h*.78,a,n%2);
   liquid.setAttribute('style','filter:none');
   liquid.setAttribute('opacity','.46');
   chocolateSurface.append(liquid);
 }
 g.append(chocolateSurface);
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
   if(key==='sauce'||(key==='special'&&i<2)||(key==='topping'&&i<6))continue;
   const k=key+':'+i;
   if(plans[k])continue;
   const zone=baseId==='s-box'?(i<2?'s-box-left':'s-box-right'):id;
   const occupied=Object.values(plans).filter(z=>z.zone===zone).flatMap(z=>z.points);
   plans[k]={zone,points:portions.makePlan(zone,photoByGroup[key][i],occupied)};
 }
 return plans;
}
function renderPortion(group,asset,pts,kind){
 for(const pt of [...pts].sort((a,b)=>a.y-b.y)){
   const fruit=pt.variant!==undefined;
   const alternate=Math.abs(Math.round(pt.x+pt.y))%2;
   const content=fruit?'fruit-'+asset+'-'+pt.variant:kind==='special'?'finish-'+asset+'-'+alternate:asset==='haribo'?'bear-'+alternate:photographSprite(asset);
   const k=asset==='haribo'?.69:1;
   const img=bitmap(content,pt.x,pt.y,pt.size*k,pt.size*k,pt.angle);
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
const topSauceBands={
 's-waffle':[
  [[126,104,58],[166,94,59],[209,83,60],[248,84,55]],
  [[109,144,61],[151,134,67],[195,124,67],[239,117,66],[284,108,64]],
  [[118,176,62],[161,168,67],[204,159,68],[249,150,67],[297,139,63]],
  [[153,200,62],[195,198,63],[238,188,65],[282,179,65],[312,168,42]]
 ],
 's-sheet':[
  [[99,108,57],[143,98,60],[190,89,63],[236,79,62],[274,70,49]],
  [[111,135,62],[156,125,66],[201,115,68],[248,105,67],[293,97,57]],
  [[125,161,60],[169,150,67],[215,141,67],[261,131,66],[308,123,61]],
  [[133,185,58],[177,176,65],[224,167,67],[270,157,64],[322,149,54]]
 ],
 's-bowl':[
  [[152,81,51],[189,70,55],[228,65,57],[262,72,52]],
  [[130,104,52],[168,100,61],[207,91,64],[249,91,59],[287,90,49]],
  [[148,126,51],[186,120,63],[226,113,65],[267,111,63],[293,109,41]],
  [[178,136,52],[215,139,58],[249,131,52],[274,124,42]]
 ]
};
function spreadTopChocolate(top,baseId,id){
 const bands=topSauceBands[baseId],asset=photoByGroup.sauce[id];
 if(!bands)return;
 const original=asset==='milk'||asset==='white';
 if(!original){
   const f=makeSvg('filter',{id:'upper-sauce-tone',x:'-5%',y:'-8%',width:'110%',height:'116%','color-interpolation-filters':'sRGB'});
   f.append(makeSvg('feColorMatrix',{type:'matrix',values:'0.30 0.58 0.12 0 0  0.30 0.58 0.12 0 0  0.30 0.58 0.12 0 0  0 0 0 1 0'}));
   const curves=makeSvg('feComponentTransfer',{});
   const shades=coatPalette[id];
   ['R','G','B'].forEach((c,i)=>curves.append(makeSvg('feFunc'+c,{type:'table',tableValues:shades.map(hex=>(parseInt(hex.slice(1+i*2,3+i*2),16)/255).toFixed(4)).join(' ')})));
   f.append(curves);top.append(f);
 }
 top.setAttribute('data-chocolate-top',chocolate[id][0]);
 bands.forEach((anchors,row)=>{
   const band=makeSvg('g',{'data-sauce-sweep':row+1});
   anchors.forEach(([x,y,w],i)=>{
     const h=[19,23,20,22,18][(i+row*2)%5],angle=[-15,-11,-19,-7,-13][(i+row)%5];
     const dab=saucePhoto(original?asset:'milk',x,y,w*(original?1:.96),h*(original?1:.91),angle,(row+i)%3===0?1:0);
     if(!original){dab.setAttribute('data-sauce-flavor',asset);dab.setAttribute('style','filter:url(#upper-sauce-tone) drop-shadow(0 .72px .72px #391d155a)');}
     else dab.setAttribute('style','filter:drop-shadow(0 .72px .72px #391d155a)');
     band.append(dab);
   });
   top.append(band);
 });
}
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
function plateCream(layers,baseId,large,choice){
 const group=makeSvg('g',{'data-special':specials[choice][0],'data-serving-layer':'cream-under-fruit'});
 if(large)group.setAttribute('transform','translate(210 145) scale(1.12) translate(-210 -145)');
 const asset=photoByGroup.special[choice];
 creamPaths[baseId][choice].forEach(([x,y,w,h,a],i)=>{
   const img=bitmap('finish-'+asset+'-'+(i===2?1:0),x,y,w,h,a);
   img.setAttribute('preserveAspectRatio','none');
   img.setAttribute('style','filter:drop-shadow(0 1.1px .95px #45251855)');
   group.append(img);
 });
 layers.append(group);
}
const garnishFields={
 's-waffle':[210,145,236,142],'s-sheet':[207,136,226,125],'s-bowl':[213,105,194,96]
};
function plateGarnish(top,baseId,ids){
 const [x,y,w,h]=garnishFields[baseId];
 ids.forEach(id=>{
   const name=photoByGroup.topping[id];
   if(!crushed.includes(name))return;
   const group=makeSvg('g',{'data-garnish':name});
   const [dx,dy,a]=[[-2,-1,-6],[5,0,17],[-6,3,8],[3,5,-14],[-7,-4,-9],[7,4,5]][id];
   const ratio=ids.length===1?1:.93;
   const field=bitmap('scatter-'+name,x+dx,y+dy,w*ratio,h*ratio,a);
   field.setAttribute('preserveAspectRatio','none');
   field.setAttribute('style','filter:drop-shadow(0 .24px .26px #2d190e55)');
   group.append(field);top.append(group);
 });
}
function dressPlate(baseId,large,state){
 const pickedSauce=(state.picks.sauce??[]).slice(1);
 const garnish=(state.picks.topping??[]).filter(i=>i<6);
 const top=makeSvg('g',{'data-plate-finish':'photo'});
 if(large)top.setAttribute('transform','translate(210 145) scale(1.12) translate(-210 -145)');
 if(!garnishFields[baseId])return top;
 if(pickedSauce.length)spreadTopChocolate(top,baseId,pickedSauce[0]);
 plateGarnish(top,baseId,garnish);
 return top;
}
function buildServingCrown(large,state,fruit){
 if(fruit.length<2||state.order.length<3)return null;
 const layer=makeSvg('g',{'data-serving':'mounded'});
 if(large)layer.setAttribute('transform','translate(210 145) scale(1.12) translate(-210 -145)');
 const positions=[[177,67,29,-19],[202,62,36,23],[235,69,34,-15],[257,84,32,15],[187,132,37,-18],[266,122,29,12],[229,131,38,-24],[151,116,29,11]];
 const fruits=[...new Set(fruit.map(p=>p.asset))];
 positions.filter((_,i)=>fruits.length>1||[1,3,4,6,7].includes(i)).sort((a,b)=>a[1]-b[1]).forEach(([x,y,size,angle],i)=>{
   renderPortion(layer,fruits[i%fruits.length],[{x,y,size,angle,tone:1.02,variant:[0,1,2,1,0,2][i]}]);
 });
 return layer;
}

function appendBoxToppings(layers,ids){
 if(!ids.length)return;
 const top=makeSvg('g',{'data-box-toppings':'waffle-only'});
 const clip=makeSvg('clipPath',{id:'box-waffle-topping-cut',clipPathUnits:'userSpaceOnUse'});
 clip.append(makeSvg('path',{d:'M118 96 L199 115 L153 193 L43 166 Z'}));top.append(clip);
 const bits=makeSvg('g',{'clip-path':'url(#box-waffle-topping-cut)'});
 const seats=[[119,113],[145,124],[174,126],[101,130],[130,139],[158,145],[82,145],[111,157],[140,166],[65,160],[91,171],[119,178]];
 for(const id of ids){
  const name=photoByGroup.topping[id],g=makeSvg('g',{'data-garnish':name});
  for(let j=0;j<(name==='haribo'?6:16);j++){
   const [sx,sy]=seats[(j+id*3)%seats.length],x=sx+((j*7+id*3)%11-5),y=sy+((j*3+id)%7-3);
   const size=name==='haribo'?12:8+(j*3+id)%5;
   const img=bitmap(name==='haribo'?'bear-'+(j%2):'crumb-'+name+'-'+(j%4),x,y,size,size*.8,(j*83+id*17)%120-60);
   // v15 supplied garnish source is the original asset; fine crumbs come from the user's v34 companion pack.
   if(name!=='haribo')img.setAttribute('href','/assets/v34/crumb-'+name+'-'+(j%4)+'.webp');
   img.setAttribute('style','filter:drop-shadow(0 .45px .6px #36201583)');g.append(img);
  }
  bits.append(g);
 }
 top.append(bits);layers.append(top);
}
function renderLayers(product,state){
 const [base,baseId]=product.base[state.base];
 const frame=sceneFrames[baseId];
 const isBowl=baseId==='s-bowl', isLargeBowl=isBowl&&state.base===3;
 const scale=isLargeBowl?1.12:1;
 const bare=bitmap(frame.asset,frame.x,frame.y,frame.w*scale,frame.h*scale);
 bare.setAttribute('class','scene-photo');
 bare.setAttribute('data-scene-base',baseId);
 const b=baseNode; b.replaceChildren(bare);
 const clip=edibleClip(frame,isLargeBowl);if(clip)b.append(clip);
 const layers=layersNode;layers.replaceChildren();layers.removeAttribute('transform');
 if(clip)layers.setAttribute('clip-path','url(#edible-scene)');else layers.removeAttribute('clip-path');
 const plans=portionPlans(state,baseId);
 const rank=key=>key==='sauce'?0:key==='fruit'?1:2;
 const visualOrder=[...state.order].sort((a,b)=>rank(...a)-rank(...b));
 const stack=[], boxStack={};
 visualOrder.forEach(([key,i])=>{
  const step=product.steps.find(x=>x.key===key), [name,id,col]=step.items[i];
  const own=state.picks[key].indexOf(i), asset=photoByGroup[key][i], g=makeSvg('g',{'data-ingredient':name});
  const group=makeSvg('g',{});if(fresh===key+':'+i&&(key!=='sauce'||active==='box'))group.setAttribute('class','fall');g.append(group);
  if(active==='box'){
   if(key==='sauce'){
     paintWell(group,asset,col,state.sauceWells[i],frame);
   }else if(key==='topping'){
     // Current UI supports all seven toppings: apply supplied photos only to the existing waffle.
   }else{
     const plan=plans[key+':'+i];
     (boxStack[plan.zone]??=[]).push(...plan.points.map(pt=>({pt,asset,name,fresh:fresh===key+':'+i})));
   }
  }else if(key==='special'&&i<2){
   // Cream spreads between the first chocolate and the fruit layer.
  }else if(id==='drizzle'){
   if(own===0)group.append(paintCoat(baseId,isLargeBowl,i));
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
   const c=left?[216,54,101,45]:[311,81,100,46];
   const portion=bitmap('box-fruit-'+(variants[key]??key),...c,left?11:14);
   portion.setAttribute('preserveAspectRatio','none');
   portion.setAttribute('style','filter:drop-shadow(0 1.35px 1.2px #71384581)');
   for(const title of [...new Set(pieces.map(p=>p.name))])bay.append(makeSvg('g',{'data-box-piece':title}));
   bay.append(portion);layers.append(bay);
 }
 if(active==='box')appendBoxToppings(layers,state.picks.topping??[]);
 if(active==='waffle')for(const id of state.picks.special??[]){if(id<2)plateCream(layers,baseId,isLargeBowl,id);}
 if(stack.length){
  const front=makeSvg('g',{'data-scene-depth':'mixed'});
  stack.sort((a,b)=>(a.pt.y+(a.key==='topping'?8:0))-(b.pt.y+(b.key==='topping'?8:0)));
  for(const {pt,asset,name,fresh,key} of stack){const g=makeSvg('g',{'data-scene-piece':name});if(key==='special')g.setAttribute('data-special-piece',name);if(fresh)g.setAttribute('class','fall');renderPortion(g,asset,[pt],key);front.append(g);}
  layers.append(front);
  if(isBowl&&state.picks.fruit?.length){const crown=buildServingCrown(isLargeBowl,state,stack.filter(item=>item.key==='fruit'));if(crown)layers.append(crown);}
 }
 if(active==='waffle')layers.append(dressPlate(baseId,isLargeBowl,state));
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
