import worker,{clean} from "../sellauth-proxy.js";
let called;
globalThis.fetch=async(url,opt)=>{called={url,auth:opt.headers.Authorization};return new Response(JSON.stringify({id:905003,name:"Tweak",description:"d",price:null,stock:null,
 deliverables:["SECRET-KEY-123"],customers:[{email:"x@y"}],images:[{id:1,url:"https://u/i.webp",private:"zz"}],
 variants:[{id:7,name:"Default",price:"40.00",price_slash:"60.00",stock:-1,deliverables:"SECRET-VARIANT",api_token:"t"}],group:{id:2,name:"Tweak",secret:"s"}}),{status:200})};
const env={SA_KEY:"KEY",SHOP_ID:"273451",ALLOWED_ORIGIN:"https://shop.it, http://127.0.0.1:5500"};
const t=async(path,origin,method="GET")=>worker.fetch(new Request("https://w.dev"+path,{method,headers:origin?{Origin:origin}:{}}),env);
const ok=async(n,c)=>console.log((c?"PASS ":"FAIL ")+n);
let r=await t("/products/905003","https://shop.it"); let b=await r.json();
await ok("prodotto restituito con CORS dell'origine consentita",r.status===200&&r.headers.get("access-control-allow-origin")==="https://shop.it"&&b.name==="Tweak");
await ok("chiave inviata a SellAuth solo lato server",called.auth==="Bearer KEY"&&called.url.endsWith("/shops/273451/products/905003"));
await ok("i campi riservati (deliverables, clienti, token) NON escono",!JSON.stringify(b).includes("SECRET")&&!JSON.stringify(b).includes("x@y")&&!("customers" in b)&&!("api_token" in b.variants[0])&&!("secret" in b.group));
await ok("prezzo, prezzo barrato e stock delle varianti restano",b.variants[0].price==="40.00"&&b.variants[0].price_slash==="60.00"&&b.variants[0].stock===-1);
r=await t("/products/905003","https://evil.com"); await ok("origine non consentita rifiutata (403)",r.status===403);
r=await t("/products/abc","https://shop.it"); await ok("ID non numerico rifiutato (404)",r.status===404);
r=await t("/shops/273451/orders","https://shop.it"); await ok("altri percorsi (ordini, clienti) rifiutati (404)",r.status===404);
r=await t("/products/905003","https://shop.it","POST"); await ok("metodi diversi da GET rifiutati",r.status===404);
r=await t("/products/905003","https://shop.it","OPTIONS"); await ok("preflight OPTIONS ok",r.status===204);
r=await worker.fetch(new Request("https://w.dev/products/1",{headers:{Origin:"https://shop.it"}}),{SHOP_ID:"1"}); await ok("senza chiave configurata: errore chiaro, nessuna chiamata",r.status===500);
