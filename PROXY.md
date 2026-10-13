# Proxy Cloudflare per l'importazione da SellAuth

Serve per importare nome, prezzo, immagine, descrizione e stock **senza** incollare la API key nel sito.
La chiave resta segreta su Cloudflare e il proxy restituisce solo i campi pubblici del prodotto.

## Installazione (5 minuti, gratis)
1. Crea un account su https://dash.cloudflare.com (gratuito) → **Workers & Pages** → **Create** → **Create Worker** → dai un nome (es. `empire-sellauth`) → **Deploy**.
2. Clicca **Edit code**, cancella tutto, incolla il contenuto di `sellauth-proxy.js` → **Deploy**.
3. **Settings → Variables and Secrets → Add**:
   - `SHOP_ID` (tipo *Text*) = `273451`
   - `SA_KEY` (tipo *Secret*) = una API key SellAuth **di sola lettura** (creane una nuova, non riusare quella incollata in chat)
   - `ALLOWED_ORIGIN` (tipo *Text*) = i tuoi siti separati da virgola, es.
     `https://tuosito.it, http://127.0.0.1:5500, http://localhost:5500`
     (gli ultimi due servono per Live Server; toglili quando il sito è online)
4. Copia l'indirizzo del Worker (es. `https://empire-sellauth.tuonome.workers.dev`).
5. Apri `js/config.js` e scrivilo in `SELLAUTH.apiProxy` (senza `/` finale):
   ```js
   apiProxy: "https://empire-sellauth.tuonome.workers.dev"
   ```
6. Ricarica il sito (Ctrl+F5). Nel Pannello, nella card, il campo "API key" sparisce: scrivi solo l'ID prodotto e l'importazione parte da sola.

## Test (opzionale)
`node tests/proxy.test.mjs` verifica che il proxy filtri i campi riservati e rifiuti origini e percorsi non consentiti (usa una finta risposta di SellAuth).

## Se qualcosa non va
- *Origine non consentita*: aggiungi l'indirizzo esatto del sito (con `http://` o `https://` e la porta) a `ALLOWED_ORIGIN`.
- *Proxy non configurato*: manca `SHOP_ID` o `SA_KEY`.
- *Importazione non riuscita (502)*: la chiave è sbagliata o non ha il permesso di leggere i prodotti.
