export const categoryLabels:Record<string,string> = {waffle:'Waffle',bowl:'Bowl',box:'Box',kumpir:'Kumpir'}
export function displayCode(code:string){return code.match(/.{1,4}/g)?.join(' ')||code}
export async function pilot<T>(action:string,body:Record<string,unknown>={}):Promise<T>{
 const response=await fetch('/api/loyalty',{method:'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...body})})
 const data=await response.json().catch(()=>({error:'Kart servisine ulaşılamadı.'}))
 if(!response.ok)throw new Error(data.error||'İşlem tamamlanamadı.')
 return data
}
export type Book={history?:{kind:string;category:string;time:string;earned:number|null;redeemed:number|null}[];total:number;categories:string[];amount:number|null;rewards:{code:string;amount:number}[];result?:string}
