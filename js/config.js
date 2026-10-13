/* =========================================================
   CONFIGURAZIONE — EMPIRE SHOP
   ---------------------------------------------------------
   MODALITÀ DEMO (FIREBASE_CONFIG = null)
   - Utenti, prodotti e accessi vengono salvati SOLO nel browser.
   - Il primo account registrato diventa automaticamente Founder.
   - Serve per provare il sito: NON è sicura per l'uso reale.

   MODALITÀ REALE (Firebase)
   1. Vai su https://console.firebase.google.com e crea un progetto.
   2. Authentication → Metodo di accesso → attiva "Email/password".
   3. Firestore Database → Crea database.
   4. Impostazioni progetto → Le tue app → aggiungi un'app Web
      e incolla qui sotto l'oggetto firebaseConfig.
   5. Scrivi la tua email in FOUNDER_EMAIL (anche in firestore.rules).
   6. Firestore → Regole → incolla il contenuto di firestore.rules → Pubblica.
   7. Registrati sul sito con la tua email PRIMA di pubblicarlo.
   ========================================================= */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCWlrXCTvMCW_6VH_2Drg1VWxAxwOhEhf0",
  authDomain: "empire-shop-a91eb.firebaseapp.com",
  projectId: "empire-shop-a91eb",
  storageBucket: "empire-shop-a91eb.firebasestorage.app",
  messagingSenderId: "881362007278",
  appId: "1:881362007278:web:134cd925d2c1b57e386fff",
  measurementId: "G-YD35E4JQ6K"
};
/* Esempio:
const FIREBASE_CONFIG = {
  apiKey: "...",
  authDomain: "empire-shop.firebaseapp.com",
  projectId: "empire-shop",
  storageBucket: "empire-shop.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
*/

const FOUNDER_EMAIL = "gabri8089@gmail.com";

/* =========================================================
   SELLAUTH — PAGAMENTI E CONSEGNA AUTOMATICA
   ---------------------------------------------------------
   Il cliente paga in una finestra SellAuth che si apre sopra il sito
   e, appena il pagamento è confermato, SellAuth gli consegna il prodotto
   in automatico (a schermo e via email).
   1. Crea il negozio su https://dash.sellauth.com e collega un metodo di pagamento.
   2. Crea i prodotti su SellAuth e carica cosa consegnare
      (Serials = chiavi/account, Files = file, Service = testo).
   3. shopId: dash.sellauth.com/api → "Shop ID" (è un numero).
      shopUrl: l'indirizzo del tuo negozio, es. "https://empireshop.mysellauth.com".
   4. Nel Pannello di controllo, in ogni card, scrivi l'ID del prodotto SellAuth.
   Finché shopId o shopUrl sono vuoti, il carrello continua a usare il ticket su Discord.
   NON scrivere mai qui la API key di SellAuth: questo file lo vede chiunque.
   ========================================================= */
const SELLAUTH = {
  shopId: 273451,
  shopUrl: "https://empire-shops.mysellauth.com",
  currency: "EUR",    // valuta mostrata nel checkout
  apiProxy: "https://empireshop.gabri8089.workers.dev"        // URL del proxy Cloudflare (vedi PROXY.md): importa i prodotti senza la API key nel browser
};

/* Nome dell'archivio demo nel browser.
   Cambialo (es. "empire-v3") per ripartire da zero: nessun account, carrello vuoto
   e card originali, anche su un computer dove avevi già aperto versioni vecchie. */
const DEMO_STORAGE = "empire-v2";
