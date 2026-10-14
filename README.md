# Empire Shop

Sito in HTML, CSS e JavaScript nativi, con particelle 3D (Three.js) ed effetti allo scroll.

## Avvio in VS Code
1. Apri la cartella `empire-shop` in VS Code.
2. Installa l'estensione **Live Server** (Ritwick Dey).
3. Tasto destro su `index.html` → **Open with Live Server**.

Serve la connessione a internet per caricare Three.js e i font Google.

## Logo
- `assets/logo.webp` → il logo (hero, login, navbar, footer e favicon)
- `assets/logo-anim.webp` → la GIF del logo convertita in WebP animata, usata nel caricamento iniziale e nella sezione Discord
- `assets/logo.svg` → riserva, usata solo se un file non si carica

## Prodotti
Modifica `js/products.js`: ogni oggetto è una card. Le categorie e i filtri si generano da soli.
Per le immagini crea `assets/prodotti/` e scrivi il percorso nel campo `image`.

## Struttura
- `index.html` – struttura della pagina
- `css/style.css` – stili (colori nelle variabili in cima al file)
- `js/products.js` – catalogo e link Discord
- `js/i18n.js` – tutte le traduzioni (italiano, inglese, spagnolo, francese, tedesco) e selettore lingua
- `js/main.js` – sfondo, emblema, scroll, ricerca, filtri, carrello, accesso e pannello Founder
- `js/backend.js` e `js/config.js` – gestione utenti e dati (demo o Firebase)

## Lingue
Il sito è disponibile in **italiano, inglese, spagnolo, francese e tedesco**. Il selettore (icona del globo con il codice lingua) è in alto a destra, nella navbar e anche nella schermata di accesso. Nel menù ogni lingua ha la sua bandierina (disegnate in SVG dentro `js/i18n.js`, funzione `flag`: se aggiungi una lingua aggiungi anche la sua bandiera).
- Alla prima visita la lingua viene scelta in base a quella del browser (se non è tra le cinque, parte in italiano); la scelta fatta dal visitatore viene ricordata.
- Cambiando lingua la pagina si aggiorna subito, senza ricaricare: testi, catalogo, carrello, messaggi, pannello Founder, formato di prezzi e date.
- **Modificare un testo**: apri `js/i18n.js`, cerca la riga con la chiave e cambia la traduzione. Ogni riga ha 5 testi nell'ordine `[IT, EN, ES, FR, DE]`.
- **Aggiungere un testo**: aggiungi una riga in `js/i18n.js`, poi nell'HTML usa `data-i18n="chiave"` (o `data-i18n-attr="placeholder:chiave"`), nel JavaScript `I18N.t("chiave")`.
- **Aggiungere una lingua**: aggiungi un elemento a `LANGS` e una traduzione in fondo a ogni riga di `TEXTS`.
- **Nomi e categorie dei prodotti** (le card che crei dal pannello) restano come li scrivi tu: non vengono tradotti. Fanno eccezione le etichette `Nuovo`, `Top`, `Hot`, `Offerta`, che appaiono nella lingua scelta.
- **Riepilogo ordine su Discord**: resta sempre nella lingua dello staff (italiano). Per cambiarla modifica `ORDER_LANG` in `js/i18n.js`.

## Descrizione dei prodotti
Nell'editor di ogni card (Pannello di controllo → Card prodotti → Nuova card / Modifica) c'è il campo **Descrizione**.
- Sulla card del catalogo se ne vedono le prime due righe; cliccando la card si apre la **finestra di dettaglio** con immagine, prezzo, disponibilità e descrizione completa.
- Puoi andare a capo; i link (`https://...`) diventano cliccabili. L'HTML non viene interpretato (per sicurezza).
- La ricerca del catalogo cerca anche nel testo della descrizione.

## Pagamenti con SellAuth e consegna automatica
Il cliente paga in una finestra di SellAuth che si apre **sopra il sito** (non lascia la pagina). Appena il pagamento è confermato,
**SellAuth consegna il prodotto in automatico**: il cliente lo vede subito nella finestra di pagamento e lo riceve anche via email.
La consegna la fa SellAuth, quindi funziona anche se il sito è statico e non serve nessun server.

### Configurazione (una volta sola)
1. Crea il negozio su [dash.sellauth.com](https://dash.sellauth.com) e collega almeno un metodo di pagamento (Stripe, PayPal, crypto...).
2. Crea su SellAuth un prodotto per ogni card e scegli il **tipo di consegna**:
   - **Serials**: chiavi, account, codici regalo. Incolli l'elenco e ogni acquirente ne riceve uno diverso (la disponibilità scende da sola).
   - **Service**: lo stesso testo per tutti (guida, metodo, link). Con "manual fulfillment" spento si consegna da solo.
   - **Files**: un file da scaricare.
   - **Dynamic**: il tuo server genera il prodotto al momento (serve programmare un webhook).
3. In `js/config.js` compila `SELLAUTH`:
   - `shopId`: il numero "Shop ID" che trovi in dash.sellauth.com/api
   - `shopUrl`: l'indirizzo del negozio, es. `https://empireshop.mysellauth.com` (o il tuo dominio personalizzato)
4. Nel Pannello di controllo apri ogni card e, nel riquadro **SellAuth · consegna automatica**, scrivi l'**ID prodotto** SellAuth
   (dash.sellauth.com → Products). L'**ID variante** è facoltativo: se lo lasci vuoto il cliente sceglie la variante nel checkout.

**Mai** scrivere la API key di SellAuth nel sito: `config.js` è pubblico. Lo `shopId` invece non è un segreto.

### Come si comporta il sito
- Card collegata a SellAuth: mostra "⚡ Consegna automatica" e nella finestra di dettaglio il pulsante **Compra ora**.
- Carrello con solo prodotti collegati: il pulsante diventa **Paga ora** e apre il checkout SellAuth con tutto il carrello;
  a pagamento riuscito quei prodotti vengono tolti dal carrello.
- Carrello con prodotti non collegati (o `SELLAUTH` non compilato): resta il vecchio flusso con riepilogo copiato e ticket su Discord.
- Sulla fattura SellAuth trovi in "metadata" `site_uid` e `site_user`: l'account del sito che ha comprato.
- La disponibilità e il prezzo **reali** sono quelli di SellAuth (se lì è esaurito il checkout blocca l'acquisto):
  tieni allineati prezzo e disponibilità della card nel pannello.

## Accesso, ruoli e pannello Founder
Il sito si apre con la schermata **Accedi / Registrati**: il catalogo è visibile solo agli utenti che hanno fatto l'accesso.

Il **Founder** ha in più, dal menu in alto a destra, il **Pannello di controllo**:
- **Card prodotti**: crea, modifica ed elimina le card (con anteprima dal vivo, caricamento immagine, descrizione e collegamento a SellAuth)
- **Accessi**: registro di chi entra, quando e da quale dispositivo
- **Utenti**: elenco iscritti, ultimo accesso, blocco e sblocco degli account

### Modalità demo (predefinita)
Con `FIREBASE_CONFIG = null` in `js/config.js` tutto viene salvato nel browser e il primo account registrato diventa Founder.
Serve per provare: chiunque esperto potrebbe modificare i dati dalla console, quindi **non usarla online**.

### Modalità reale con Firebase (gratuita)
Segui i passaggi scritti in cima a `js/config.js`, poi copia `firestore.rules` nelle regole di Firestore
(sostituendo l'email del founder). Così ruoli, blocchi e permessi sono controllati dai server di Google
e nessuno può darsi il ruolo di Founder.

### Ripartire da zero
In modalità demo i dati restano salvati nel browser. Per far ripartire il sito da zero (nessun account,
card originali, carrello vuoto) cambia `DEMO_STORAGE` in `js/config.js`, ad esempio da `"empire-v2"` a `"empire-v3"`.

## File unico da condividere
Basta aprirlo con doppio clic: funziona anche senza internet, servono solo i font di Google per la tipografia definitiva.

## Registro accessi: IP e dispositivo
Nel pannello Founder, scheda **Accessi**, ogni riga mostra utente, email, data e ora, **indirizzo IP** e dispositivo (browser · sistema operativo, es. "Chrome · Windows"). Puoi cercare anche per IP.
- L'IP viene letto da servizi esterni gratuiti (ipify, Cloudflare, ipapi: elenco `IP_SERVICES` in `js/backend.js`), interrogati insieme: vale il primo che risponde. Se sono tutti bloccati (adblock, offline) o la pagina non può chiamare siti esterni, nella colonna compare "—" e l'accesso viene registrato lo stesso. Gli accessi fatti prima di questa funzione restano senza IP.
- Con **Firebase** il registro è condiviso e lo vedi da qualsiasi dispositivo. In **modalità demo** i dati restano nel browser, quindi vedi solo gli accessi fatti da quel browser.
- Gli IP sono dati personali (GDPR): conviene dirlo nella privacy policy del sito.

## Password dimenticata
Nella schermata di accesso c'è il link **Password dimenticata?**: scrivi l'email e premi il link.
- Con **Firebase** parte un'email con il link per scegliere una nuova password. Le password non le vede nessuno, nemmeno tu: Firebase le conserva cifrate.
- In **modalità demo** il recupero non esiste (gli account vivono solo nel browser). Per ripartire da zero cambia `DEMO_STORAGE` in `js/config.js`: il primo account che registri torna a essere Founder.

## Stato del collegamento Firebase
`js/config.js` contiene la configurazione del progetto Firebase (`FIREBASE_CONFIG`), quindi il sito usa il database vero. Prima di usarlo restano da fare:
1. ~~Email Founder~~: già impostata (`gabri8089@gmail.com`) in `js/config.js` e in `firestore.rules`. Per cambiarla modifica entrambi i file.
2. In Firebase: Authentication → attiva "Email/password"; Firestore Database → crea il database; Firestore → Regole → incolla `firestore.rules` → Pubblica.
3. Registrati sul sito con la tua email per diventare Founder.
Il sito va aperto da un indirizzo web (anche `localhost` o l'hosting): Firebase Authentication non funziona in modo affidabile aprendo il file con doppio clic.
