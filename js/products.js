/* =========================================================
   CATALOGO PRODOTTI — EMPIRE SHOP
   ---------------------------------------------------------
   Modifica qui i prodotti. Ogni oggetto è una card.
   - name:     nome del prodotto
   - category: categoria (i filtri si creano da soli)
   - price:    prezzo in euro (numero, es. 19.9)
   - oldPrice: prezzo barrato (facoltativo, metti null se non serve)
   - stock:    pezzi disponibili (0 = esaurito)
   - badge:    etichetta (facoltativa, es. "Nuovo", "Top", null)
   - image:    percorso immagine, es. "assets/prodotti/felpa.png"
               lascia "" per usare la copertina generata automaticamente
   - description:       testo che il cliente vede cliccando la card (facoltativo)
   - sellauthProductId: ID del prodotto su SellAuth (facoltativo). Se c'è, il cliente
                        paga sul sito e riceve il prodotto in automatico
   - sellauthVariantId: ID della variante SellAuth (facoltativo: se manca sceglie il cliente)
   Questi dati servono solo al primo avvio: poi le card si gestiscono dal Pannello di controllo.
   ========================================================= */

const PRODUCTS = [
  { id: 1, name: "Tweak PC ADVANCED", category: "Tweak", price: 40.00, oldPrice: 60.00, stock: 0, infinite: true, badge: "Top",
    image: "https://static.mysellauth.com/storage/images/1183882.webp",
    description: "Tweak personalizzato avanzato by Empire Shop.\nOltre 70 ottimizzazioni per ridurre l'input lag, stabilizzare gli FPS e rendere il sistema più reattivo.\nConsegna istantanea dopo il pagamento.",
    // ID prodotto SellAuth (dash.sellauth.com → Prodotti). Se vuoto, il pagamento resta su Discord.
    sellauthProductId: "905003"
  }
];

/* Link del server Discord usato da tutti i pulsanti di supporto/checkout */
const DISCORD_URL = "https://discord.gg/wVfrUMEGZz";
