/* =========================================================
   LINGUE — EMPIRE SHOP
   ---------------------------------------------------------
   Lingue disponibili: italiano, inglese, spagnolo, francese, tedesco.

   COME SI MODIFICA UN TESTO
   Ogni riga della tabella TEXTS ha una chiave e 5 traduzioni,
   sempre nello stesso ordine:  [ IT, EN, ES, FR, DE ]

   COME SI AGGIUNGE UN TESTO NUOVO
   1. Aggiungi una riga in TEXTS con la nuova chiave e le 5 traduzioni.
   2. Nell'HTML usa  data-i18n="chiave"  (testo)
      oppure  data-i18n-attr="placeholder:chiave"  (placeholder, aria-label...).
   3. Nel JavaScript usa  I18N.t("chiave")  e, se serve,  I18N.t("chiave", { nome: "valore" })
      per i segnaposto {nome} dentro al testo.

   COME SI AGGIUNGE UNA LINGUA
   Aggiungi un elemento a LANGS e una traduzione in fondo a ogni riga di TEXTS.
   ========================================================= */

const I18N = (() => {
  "use strict";

  const LANGS = [
    { code: "it", name: "Italiano", locale: "it-IT" },
    { code: "en", name: "English",  locale: "en-GB" },
    { code: "es", name: "Español",  locale: "es-ES" },
    { code: "fr", name: "Français", locale: "fr-FR" },
    { code: "de", name: "Deutsch",  locale: "de-DE" }
  ];
  const DEFAULT_LANG = "it";
  const STORE_KEY = "empire-lang";

  /* Lingua del riepilogo ordine che il cliente incolla nel ticket Discord.
     Lo legge lo staff, quindi resta fissa. Cambiala (es. "en") se il tuo staff lavora in un'altra lingua. */
  const ORDER_LANG = "it";

  /*                    IT                      EN                       ES                       FR                       DE   */
  const TEXTS = {
    /* ---- Pagina ---- */
    "meta.title": ["Empire Shop — Reselling di prodotti a prezzi imbattibili", "Empire Shop — Reselling products at unbeatable prices", "Empire Shop — Reventa de productos a precios imbatibles", "Empire Shop — Revente de produits à prix imbattables", "Empire Shop — Wiederverkauf von Produkten zu unschlagbaren Preisen"],
    "meta.desc": ["Empire Shop: prodotti selezionati a prezzi competitivi, consegna rapida e supporto 24/7 su Discord.", "Empire Shop: carefully selected products at competitive prices, fast delivery and 24/7 support on Discord.", "Empire Shop: productos seleccionados a precios competitivos, entrega rápida y soporte 24/7 en Discord.", "Empire Shop : produits sélectionnés à prix compétitifs, livraison rapide et assistance 24/7 sur Discord.", "Empire Shop: ausgewählte Produkte zu wettbewerbsfähigen Preisen, schnelle Lieferung und 24/7-Support auf Discord."],
    "lang.label": ["Lingua", "Language", "Idioma", "Langue", "Sprache"],

    /* ---- Parole ricorrenti ---- */
    "common.fast": ["Consegna rapida", "Fast delivery", "Entrega rápida", "Livraison rapide", "Schnelle Lieferung"],
    "common.support247": ["Supporto 24/7", "24/7 support", "Soporte 24/7", "Assistance 24/7", "24/7-Support"],
    "common.unbeatable": ["Prezzi imbattibili", "Unbeatable prices", "Precios imbatibles", "Prix imbattables", "Unschlagbare Preise"],
    "common.joinDiscord": ["Entra nel Discord", "Join the Discord", "Entra en Discord", "Rejoindre le Discord", "Discord beitreten"],
    "common.close": ["Chiudi", "Close", "Cerrar", "Fermer", "Schließen"],

    /* ---- Accesso e registrazione ---- */
    "auth.aria": ["Accedi o registrati", "Log in or sign up", "Inicia sesión o regístrate", "Connectez-vous ou inscrivez-vous", "Anmelden oder registrieren"],
    "auth.title": ["Benvenuto nell'impero.", "Welcome to the empire.", "Bienvenido al imperio.", "Bienvenue dans l'empire.", "Willkommen im Imperium."],
    "auth.text": ["Accedi o crea un account per vedere il catalogo, ordinare e seguire i tuoi acquisti.", "Log in or create an account to browse the catalog, place orders and track your purchases.", "Inicia sesión o crea una cuenta para ver el catálogo, hacer pedidos y seguir tus compras.", "Connectez-vous ou créez un compte pour consulter le catalogue, commander et suivre vos achats.", "Melde dich an oder erstelle ein Konto, um den Katalog zu sehen, zu bestellen und deine Einkäufe zu verfolgen."],
    "auth.login": ["Accedi", "Log in", "Iniciar sesión", "Se connecter", "Anmelden"],
    "auth.register": ["Registrati", "Sign up", "Registrarse", "S'inscrire", "Registrieren"],
    "auth.email": ["Email", "Email", "Correo electrónico", "E-mail", "E-Mail"],
    "auth.emailPh": ["nome@email.it", "name@email.com", "nombre@email.com", "nom@email.fr", "name@email.de"],
    "auth.password": ["Password", "Password", "Contraseña", "Mot de passe", "Passwort"],
    "auth.passwordPh": ["La tua password", "Your password", "Tu contraseña", "Votre mot de passe", "Dein Passwort"],
    "auth.show": ["Mostra", "Show", "Mostrar", "Afficher", "Anzeigen"],
    "auth.hide": ["Nascondi", "Hide", "Ocultar", "Masquer", "Verbergen"],
    "auth.showPass": ["Mostra password", "Show password", "Mostrar contraseña", "Afficher le mot de passe", "Passwort anzeigen"],
    "auth.hidePass": ["Nascondi password", "Hide password", "Ocultar contraseña", "Masquer le mot de passe", "Passwort verbergen"],
    "auth.forgot": ["Password dimenticata?", "Forgot your password?", "¿Olvidaste tu contraseña?", "Mot de passe oublié ?", "Passwort vergessen?"],
    "auth.noAccount": ["Non hai un account?", "Don't have an account?", "¿No tienes una cuenta?", "Pas encore de compte ?", "Noch kein Konto?"],
    "auth.haveAccount": ["Hai già un account?", "Already have an account?", "¿Ya tienes una cuenta?", "Vous avez déjà un compte ?", "Du hast schon ein Konto?"],
    "auth.name": ["Nome utente", "Username", "Nombre de usuario", "Nom d'utilisateur", "Benutzername"],
    "auth.namePh": ["Come vuoi farti chiamare", "How should we call you?", "Cómo quieres que te llamemos", "Comment souhaitez-vous être appelé", "Wie möchtest du genannt werden?"],
    "auth.newPassPh": ["Almeno 8 caratteri", "At least 8 characters", "Al menos 8 caracteres", "8 caractères minimum", "Mindestens 8 Zeichen"],
    "auth.confirm": ["Conferma password", "Confirm password", "Confirmar contraseña", "Confirmer le mot de passe", "Passwort bestätigen"],
    "auth.confirmPh": ["Ripeti la password", "Repeat the password", "Repite la contraseña", "Répétez le mot de passe", "Passwort wiederholen"],
    "auth.create": ["Crea account", "Create account", "Crear cuenta", "Créer un compte", "Konto erstellen"],
    "auth.demo": ["Modalità demo: i dati restano solo in questo browser. Il primo account registrato diventa Founder.", "Demo mode: data stays in this browser only. The first account to sign up becomes Founder.", "Modo demo: los datos se quedan solo en este navegador. La primera cuenta registrada se convierte en Founder.", "Mode démo : les données restent uniquement dans ce navigateur. Le premier compte créé devient Founder.", "Demo-Modus: Die Daten bleiben nur in diesem Browser. Das erste registrierte Konto wird Founder."],
    "auth.err.name": ["Scegli un nome utente.", "Choose a username.", "Elige un nombre de usuario.", "Choisissez un nom d'utilisateur.", "Wähle einen Benutzernamen."],
    "auth.err.email": ["Inserisci un'email valida.", "Enter a valid email.", "Introduce un correo válido.", "Saisissez une adresse e-mail valide.", "Gib eine gültige E-Mail-Adresse ein."],
    "auth.err.pass": ["La password deve avere almeno 8 caratteri.", "The password must be at least 8 characters long.", "La contraseña debe tener al menos 8 caracteres.", "Le mot de passe doit contenir au moins 8 caractères.", "Das Passwort muss mindestens 8 Zeichen lang sein."],
    "auth.err.match": ["Le due password non coincidono.", "The two passwords don't match.", "Las dos contraseñas no coinciden.", "Les deux mots de passe ne correspondent pas.", "Die beiden Passwörter stimmen nicht überein."],
    "auth.err.loginEmail": ["Inserisci la tua email.", "Enter your email.", "Introduce tu correo.", "Saisissez votre e-mail.", "Gib deine E-Mail-Adresse ein."],
    "auth.err.loginPass": ["Inserisci la password.", "Enter your password.", "Introduce tu contraseña.", "Saisissez votre mot de passe.", "Gib dein Passwort ein."],
    "auth.creating": ["Creazione account…", "Creating account…", "Creando cuenta…", "Création du compte…", "Konto wird erstellt …"],
    "auth.loggingIn": ["Accesso in corso…", "Logging in…", "Iniciando sesión…", "Connexion en cours…", "Anmeldung läuft …"],
    "auth.serverErr": ["Impossibile collegarsi al server. Controlla la connessione e js/config.js.", "Unable to reach the server. Check your connection and js/config.js.", "No se puede conectar con el servidor. Revisa la conexión y js/config.js.", "Impossible de se connecter au serveur. Vérifiez la connexion et js/config.js.", "Verbindung zum Server nicht möglich. Prüfe die Verbindung und js/config.js."],

    /* ---- Navbar e menu utente ---- */
    "nav.aria": ["Navigazione principale", "Main navigation", "Navegación principal", "Navigation principale", "Hauptnavigation"],
    "nav.home": ["Home", "Home", "Inicio", "Accueil", "Start"],
    "nav.products": ["Prodotti", "Products", "Productos", "Produits", "Produkte"],
    "nav.benefits": ["Vantaggi", "Benefits", "Ventajas", "Avantages", "Vorteile"],
    "nav.how": ["Come funziona", "How it works", "Cómo funciona", "Comment ça marche", "So funktioniert's"],
    "nav.support": ["Supporto", "Support", "Soporte", "Assistance", "Support"],
    "nav.cartOpen": ["Apri il carrello", "Open the cart", "Abrir el carrito", "Ouvrir le panier", "Warenkorb öffnen"],
    "nav.burger": ["Apri il menu", "Open the menu", "Abrir el menú", "Ouvrir le menu", "Menü öffnen"],
    "nav.panel": ["Pannello Founder", "Founder panel", "Panel de Founder", "Panneau Founder", "Founder-Panel"],
    "nav.logout": ["Esci", "Log out", "Cerrar sesión", "Se déconnecter", "Abmelden"],
    "role.customer": ["Cliente", "Customer", "Cliente", "Client", "Kunde"],

    /* ---- Hero ---- */
    "hero.kicker": ["Il tuo impero del reselling", "Your reselling empire", "Tu imperio de la reventa", "Votre empire de la revente", "Dein Reselling-Imperium"],
    "hero.l1": ["Prendi", "Get", "Consigue", "Obtenez", "Hol dir"],
    "hero.l2": ["di più.", "more.", "más.", "plus.", "mehr."],
    "hero.l3": ["Paga meno.", "Pay less.", "Paga menos.", "Payez moins.", "Zahl weniger."],
    "hero.text": ["Prodotti selezionati, prezzi che non trovi altrove e un'assistenza che ti risponde davvero. Scegli, ordina e ricevi in pochi minuti.", "Carefully selected products, prices you won't find elsewhere and support that actually answers. Choose, order and receive in a few minutes.", "Productos seleccionados, precios que no encuentras en otro sitio y una atención que de verdad te responde. Elige, pide y recibe en pocos minutos.", "Des produits sélectionnés, des prix introuvables ailleurs et une assistance qui répond vraiment. Choisissez, commandez et recevez en quelques minutes.", "Ausgewählte Produkte, Preise, die du sonst nirgends findest, und ein Support, der wirklich antwortet. Auswählen, bestellen und in wenigen Minuten erhalten."],
    "hero.cta": ["Scopri i prodotti", "Explore the products", "Descubre los productos", "Découvrir les produits", "Produkte entdecken"],
    "hero.stat1t": ["Qualità garantita", "Guaranteed quality", "Calidad garantizada", "Qualité garantie", "Garantierte Qualität"],
    "hero.stat1": ["Ricevi sempre ciò che hai ordinato", "You always get what you ordered", "Recibes siempre lo que pides", "Vous recevez toujours ce que vous commandez", "Du erhältst immer, was du bestellt hast"],
    "hero.stat2t": ["Consegna immediata", "Instant delivery", "Entrega inmediata", "Livraison immédiate", "Sofortige Lieferung"],
    "hero.stat2": ["Subito dopo il pagamento", "Right after payment", "Justo después del pago", "Juste après le paiement", "Direkt nach der Zahlung"],
    "hero.stat3t": ["Assistenza in tempo reale", "Live support", "Asistencia en tiempo real", "Assistance en temps réel", "Live-Support"],
    "hero.stat3": ["Supporto disponibile 24/7", "Support available 24/7", "Soporte disponible 24/7", "Support disponible 24/7", "Support rund um die Uhr"],
    "perk.1t": ["Qualità garantita", "Guaranteed quality", "Calidad garantizada", "Qualité garantie", "Garantierte Qualität"],
    "perk.1p": ["Ogni prodotto viene controllato e verificato manualmente prima della spedizione. Riceverai sempre esattamente ciò che hai ordinato.", "Every product is hand-checked and verified before shipping. You will always receive exactly what you ordered.", "Cada producto se revisa y verifica manualmente antes del envío. Siempre recibirás exactamente lo que has pedido.", "Chaque produit est contrôlé et vérifié manuellement avant l'expédition. Vous recevrez toujours exactement ce que vous avez commandé.", "Jedes Produkt wird vor dem Versand von Hand geprüft und verifiziert. Du erhältst immer genau das, was du bestellt hast."],
    "perk.2t": ["Consegna immediata", "Instant delivery", "Entrega inmediata", "Livraison immédiate", "Sofortige Lieferung"],
    "perk.2p": ["L'automazione del nostro sistema garantisce che tu possa ottenere il tuo account o il software in pochi secondi dopo l'acquisto.", "The automation of our system ensures you get your account or software within seconds after purchase.", "La automatización de nuestro sistema garantiza que obtengas tu cuenta o el software a los pocos segundos de la compra.", "L'automatisation de notre système garantit que vous obtenez votre compte ou votre logiciel quelques secondes après l'achat.", "Die Automatisierung unseres Systems stellt sicher, dass du dein Konto oder die Software wenige Sekunden nach dem Kauf erhältst."],
    "perk.3t": ["Assistenza in tempo reale", "Live support", "Asistencia en tiempo real", "Assistance en temps réel", "Live-Support"],
    "perk.3p": ["Il nostro team di supporto è disponibile 24 ore su 24 per assisterti con qualsiasi problema, in qualsiasi momento.", "Our support team is available 24 hours a day to help you with any issue, at any time.", "Nuestro equipo de soporte está disponible las 24 horas del día para ayudarte con cualquier problema, en cualquier momento.", "Notre équipe d'assistance est disponible 24 h sur 24 pour vous aider en cas de problème, à tout moment.", "Unser Support-Team ist rund um die Uhr erreichbar und hilft dir bei jedem Problem, jederzeit."],
    "hero.scroll": ["Scorri ai prodotti", "Scroll to the products", "Desplázate a los productos", "Faire défiler vers les produits", "Zu den Produkten scrollen"],

    /* ---- Catalogo ---- */
    "prod.title": ["Il catalogo", "The catalog", "El catálogo", "Le catalogue", "Der Katalog"],
    "prod.text": ["Cerca un prodotto o scegli una categoria, clicca una card per i dettagli e paga direttamente sul sito.", "Search for a product or pick a category, click a card for the details and pay right here on the site.", "Busca un producto o elige una categoría, haz clic en una tarjeta para ver los detalles y paga directamente en la web.", "Cherchez un produit ou choisissez une catégorie, cliquez sur une carte pour les détails et payez directement sur le site.", "Suche ein Produkt oder wähle eine Kategorie, klicke auf eine Karte für die Details und bezahle direkt auf der Seite."],
    "prod.searchPh": ["Che cosa stai cercando...", "What are you looking for...", "¿Qué estás buscando?...", "Que cherchez-vous...", "Wonach suchst du ..."],
    "prod.searchAria": ["Cerca un prodotto", "Search for a product", "Buscar un producto", "Rechercher un produit", "Produkt suchen"],
    "prod.clearAria": ["Cancella la ricerca", "Clear the search", "Borrar la búsqueda", "Effacer la recherche", "Suche löschen"],
    "prod.catAria": ["Categorie prodotti", "Product categories", "Categorías de productos", "Catégories de produits", "Produktkategorien"],
    "prod.all": ["Tutti", "All", "Todos", "Tous", "Alle"],
    "prod.result1": ["1 risultato", "1 result", "1 resultado", "1 résultat", "1 Ergebnis"],
    "prod.resultN": ["{n} risultati", "{n} results", "{n} resultados", "{n} résultats", "{n} Ergebnisse"],
    "prod.emptySearch": [`Nessun risultato per "{q}". Prova con un'altra parola o {btn}.`, `No results for "{q}". Try another word or {btn}.`, `Sin resultados para "{q}". Prueba con otra palabra o {btn}.`, `Aucun résultat pour « {q} ». Essayez un autre mot ou {btn}.`, `Keine Ergebnisse für „{q}“. Versuche ein anderes Wort oder {btn}.`],
    "prod.showAll": ["mostra tutti i prodotti", "show all products", "mostrar todos los productos", "afficher tous les produits", "alle Produkte anzeigen"],
    "prod.emptyCat": ["Nessun prodotto in questa categoria, torna presto.", "No products in this category, check back soon.", "No hay productos en esta categoría, vuelve pronto.", "Aucun produit dans cette catégorie, revenez bientôt.", "Keine Produkte in dieser Kategorie, schau bald wieder vorbei."],
    "card.out": ["Esaurito", "Sold out", "Agotado", "Épuisé", "Ausverkauft"],
    "card.inf": ["∞ Disponibile", "∞ In stock", "∞ Disponible", "∞ Disponible", "∞ Verfügbar"],
    "ed.saKey": ["API key SellAuth (resta solo su questo browser, mai nel sito)", "SellAuth API key (stays in this browser only, never in the site)", "API key de SellAuth (solo en este navegador, nunca en el sitio)", "Clé API SellAuth (reste uniquement dans ce navigateur, jamais dans le site)", "SellAuth-API-Key (bleibt nur in diesem Browser, nie auf der Seite)"],
    "ed.saImport": ["↻ Importa da SellAuth", "↻ Import from SellAuth", "↻ Importar desde SellAuth", "↻ Importer depuis SellAuth", "↻ Von SellAuth importieren"],
    "ed.saBusy": ["Importo i dati da SellAuth…", "Importing from SellAuth…", "Importando desde SellAuth…", "Import depuis SellAuth…", "Import von SellAuth…"],
    "ed.saDone": ["Fatto: nome, descrizione, prezzo, immagine e disponibilità copiati da SellAuth. Controlla e salva.", "Done: name, description, price, image and stock copied from SellAuth. Review and save.", "Hecho: nombre, descripción, precio, imagen y stock copiados de SellAuth. Revisa y guarda.", "Terminé : nom, description, prix, image et stock copiés depuis SellAuth. Vérifiez et enregistrez.", "Fertig: Name, Beschreibung, Preis, Bild und Bestand von SellAuth übernommen. Prüfen und speichern."],
    "ed.saFail": ["Importazione non riuscita", "Import failed", "Importación fallida", "Échec de l'import", "Import fehlgeschlagen"],
    "ed.saNoKey": ["Inserisci prima la API key SellAuth qui sotto (dash.sellauth.com → Account → API).", "Enter your SellAuth API key below first (dash.sellauth.com → Account → API).", "Introduce primero la API key de SellAuth (dash.sellauth.com → Cuenta → API).", "Saisissez d'abord la clé API SellAuth (dash.sellauth.com → Compte → API).", "Gib zuerst unten den SellAuth-API-Key ein (dash.sellauth.com → Konto → API)."],
    "ed.saBadKey": ["API key non valida", "invalid API key", "API key no válida", "clé API invalide", "ungültiger API-Key"],
    "ed.saNotFound": ["ID prodotto non trovato", "product ID not found", "ID de producto no encontrado", "ID produit introuvable", "Produkt-ID nicht gefunden"],
    "ed.saManual": ["Mostra / nascondi campi manuali", "Show / hide manual fields", "Mostrar / ocultar campos manuales", "Afficher / masquer les champs manuels", "Manuelle Felder ein-/ausblenden"],
    "ed.saShape": ["Risposta ricevuta ma senza nome né prezzo. Campi ricevuti:", "Response received but without name or price. Fields received:", "Respuesta recibida sin nombre ni precio. Campos recibidos:", "Réponse reçue sans nom ni prix. Champs reçus :", "Antwort ohne Name und Preis erhalten. Empfangene Felder:"],
    "ed.saNet": ["il browser blocca la connessione diretta a SellAuth (CORS): serve il proxy gratuito, vedi sellauth-proxy.js", "the browser blocks the direct connection to SellAuth (CORS): the free proxy is needed, see sellauth-proxy.js", "el navegador bloquea la conexión directa con SellAuth (CORS): hace falta el proxy gratuito, ver sellauth-proxy.js", "le navigateur bloque la connexion directe à SellAuth (CORS) : le proxy gratuit est nécessaire, voir sellauth-proxy.js", "der Browser blockiert die direkte Verbindung zu SellAuth (CORS): der kostenlose Proxy ist nötig, siehe sellauth-proxy.js"],
    "ed.saNoId": ["Scrivi prima l'ID del prodotto SellAuth.", "Enter the SellAuth product ID first.", "Escribe primero el ID del producto de SellAuth.", "Saisissez d'abord l'ID du produit SellAuth.", "Gib zuerst die SellAuth-Produkt-ID ein."],
    "ed.saNeedImport": ["Prima importa i dati: scrivi l'ID prodotto SellAuth e premi \"Importa da SellAuth\" (serve la API key).", "Import the data first: enter the SellAuth product ID and press \"Import from SellAuth\" (API key needed).", "Primero importa los datos: escribe el ID de SellAuth y pulsa \"Importar desde SellAuth\" (hace falta la API key).", "Importez d'abord les données : saisissez l'ID SellAuth et appuyez sur \"Importer depuis SellAuth\" (clé API requise).", "Importiere zuerst die Daten: SellAuth-Produkt-ID eingeben und \"Von SellAuth importieren\" drücken (API-Key nötig)."],
    "sec.verifyText": ["Verifica la tua email Founder: senza verifica le regole di sicurezza bloccheranno le modifiche ai prodotti.", "Verify your Founder email: without verification the security rules will block product changes.", "Verifica tu email de Founder: sin verificar, las reglas de seguridad bloquearán los cambios de productos.", "Vérifiez votre e-mail Founder : sans vérification, les règles de sécurité bloqueront les modifications.", "Bestätige deine Founder-E-Mail: ohne Bestätigung blockieren die Sicherheitsregeln Produktänderungen."],
    "sec.verifyBtn": ["Invia email di verifica", "Send verification email", "Enviar email de verificación", "Envoyer l'e-mail de vérification", "Bestätigungs-E-Mail senden"],
    "sec.verifySent": ["Email di verifica inviata a", "Verification email sent to", "Email de verificación enviado a", "E-mail de vérification envoyé à", "Bestätigungs-E-Mail gesendet an"],
    "sec.verifyFail": ["Invio non riuscito: riprova tra poco.", "Sending failed: try again shortly.", "Envío fallido: inténtalo de nuevo en breve.", "Échec de l'envoi : réessayez dans un instant.", "Senden fehlgeschlagen: gleich noch einmal versuchen."],
    "pm.unavailable": ["Questo prodotto non è ancora acquistabile online.", "This product can't be bought online yet.", "Este producto aún no se puede comprar online.", "Ce produit n'est pas encore disponible à l'achat en ligne.", "Dieses Produkt ist online noch nicht kaufbar."],
    "sec.verifyHint": ["Chiudi questa finestra, premi \"Invia email di verifica\" nel riquadro giallo del Pannello, apri il link nella mail e poi riprova a salvare.", "Close this window, press \"Send verification email\" in the yellow box of the Panel, open the link in the email and then try saving again.", "Cierra esta ventana, pulsa \"Enviar email de verificación\" en el recuadro amarillo del Panel, abre el enlace del correo y vuelve a guardar.", "Fermez cette fenêtre, appuyez sur « Envoyer l'e-mail de vérification » dans l'encadré jaune du Panneau, ouvrez le lien reçu puis réessayez d'enregistrer.", "Schließe dieses Fenster, drücke im gelben Feld des Panels auf \"Bestätigungs-E-Mail senden\", öffne den Link in der E-Mail und speichere dann erneut."],
    "sec.verifyDrop": ["⚠ Email non verificata", "⚠ Email not verified", "⚠ Email sin verificar", "⚠ E-mail non vérifié", "⚠ E-Mail nicht bestätigt"],
    "ed.infinite": ["Stock infinito (∞) — sempre disponibile", "Infinite stock (∞) — always available", "Stock infinito (∞) — siempre disponible", "Stock infini (∞) — toujours disponible", "Unbegrenzter Bestand (∞) — immer verfügbar"],
    "card.stock": ["{n} disponibili", "{n} available", "{n} disponibles", "{n} disponibles", "{n} verfügbar"],
    "card.noCat": ["Senza categoria", "Uncategorized", "Sin categoría", "Sans catégorie", "Ohne Kategorie"],
    "card.noName": ["Nome prodotto", "Product name", "Nombre del producto", "Nom du produit", "Produktname"],
    "card.addAria": ["Aggiungi {name} al carrello", "Add {name} to the cart", "Añadir {name} al carrito", "Ajouter {name} au panier", "{name} in den Warenkorb legen"],
    "badge.nuovo": ["Nuovo", "New", "Nuevo", "Nouveau", "Neu"],
    "badge.top": ["Top", "Top", "Top", "Top", "Top"],
    "badge.hot": ["Hot", "Hot", "Hot", "Hot", "Hot"],
    "badge.offerta": ["Offerta", "Deal", "Oferta", "Offre", "Angebot"],

    /* ---- Vantaggi ---- */
    "feat.title": ["Perché Empire", "Why Empire", "Por qué Empire", "Pourquoi Empire", "Warum Empire"],
    "feat.text": ["Comprare deve essere semplice, veloce e sicuro. Ecco cosa ti garantiamo.", "Buying should be simple, fast and safe. Here's what we guarantee.", "Comprar debe ser sencillo, rápido y seguro. Esto es lo que te garantizamos.", "Acheter doit être simple, rapide et sûr. Voici ce que nous vous garantissons.", "Einkaufen soll einfach, schnell und sicher sein. Das garantieren wir dir."],
    "feat.1.t": ["Pagamenti semplici", "Easy payments", "Pagos sencillos", "Paiements simples", "Einfache Zahlung"],
    "feat.1.p": ["Paghi con il metodo che preferisci, senza passaggi inutili.", "Pay with the method you prefer, with no unnecessary steps.", "Paga con el método que prefieras, sin pasos innecesarios.", "Payez avec le moyen de votre choix, sans étapes inutiles.", "Bezahle mit der Methode deiner Wahl, ohne unnötige Schritte."],
    "feat.2.t": ["Prezzi competitivi", "Competitive prices", "Precios competitivos", "Prix compétitifs", "Wettbewerbsfähige Preise"],
    "feat.2.p": ["Selezioniamo le offerte migliori per farti risparmiare su ogni acquisto.", "We pick the best deals to help you save on every purchase.", "Seleccionamos las mejores ofertas para que ahorres en cada compra.", "Nous sélectionnons les meilleures offres pour vous faire économiser à chaque achat.", "Wir wählen die besten Angebote aus, damit du bei jedem Kauf sparst."],
    "feat.3.t": ["Venditore affidabile", "Reliable seller", "Vendedor de confianza", "Vendeur fiable", "Zuverlässiger Verkäufer"],
    "feat.3.p": ["Ogni ordine viene seguito dallo staff fino alla consegna.", "Every order is followed by our staff until delivery.", "Cada pedido es seguido por el staff hasta la entrega.", "Chaque commande est suivie par l'équipe jusqu'à la livraison.", "Jede Bestellung wird vom Team bis zur Lieferung betreut."],
    "feat.4.p": ["Ricevi quello che hai acquistato nel minor tempo possibile.", "Get what you bought as quickly as possible.", "Recibe lo que has comprado en el menor tiempo posible.", "Recevez ce que vous avez acheté dans les meilleurs délais.", "Erhalte deinen Einkauf so schnell wie möglich."],
    "feat.5.p": ["Lo staff risponde su Discord ogni giorno, a qualsiasi ora.", "Our staff answers on Discord every day, at any hour.", "El staff responde en Discord todos los días, a cualquier hora.", "L'équipe répond sur Discord tous les jours, à toute heure.", "Unser Team antwortet jeden Tag zu jeder Uhrzeit auf Discord."],
    "feat.6.t": ["Community attiva", "Active community", "Comunidad activa", "Communauté active", "Aktive Community"],
    "feat.6.p": ["Offerte in anteprima, giveaway e novità per chi è nel server.", "Early access to deals, giveaways and news for everyone in the server.", "Ofertas en primicia, sorteos y novedades para quienes están en el servidor.", "Offres en avant-première, giveaways et nouveautés pour les membres du serveur.", "Angebote vorab, Gewinnspiele und Neuigkeiten für alle auf dem Server."],

    /* ---- Come funziona ---- */
    "steps.title": ["Tre passi e hai finito", "Three steps and you're done", "Tres pasos y listo", "Trois étapes et c'est fait", "Drei Schritte und du bist fertig"],
    "steps.1.t": ["Scegli", "Choose", "Elige", "Choisissez", "Auswählen"],
    "steps.1.p": ["Sfoglia il catalogo e aggiungi al carrello quello che ti serve.", "Browse the catalog and add what you need to the cart.", "Explora el catálogo y añade al carrito lo que necesites.", "Parcourez le catalogue et ajoutez au panier ce dont vous avez besoin.", "Stöbere im Katalog und leg in den Warenkorb, was du brauchst."],
    "steps.2.t": ["Ordina", "Order", "Pide", "Commandez", "Bestellen"],
    "steps.2.p": ["Paga in modo sicuro direttamente dal sito, con il metodo che preferisci.", "Pay securely right from the site, with the method you prefer.", "Paga de forma segura directamente desde la web, con el método que prefieras.", "Payez en toute sécurité directement depuis le site, avec le moyen de votre choix.", "Bezahle sicher direkt auf der Seite, mit der Methode deiner Wahl."],
    "steps.3.t": ["Ricevi", "Receive", "Recibe", "Recevez", "Erhalten"],
    "steps.3.p": ["Appena il pagamento è confermato ricevi il prodotto in automatico, a schermo e via email.", "As soon as payment is confirmed you get your product automatically, on screen and by email.", "En cuanto se confirma el pago recibes el producto automáticamente, en pantalla y por correo.", "Dès que le paiement est confirmé, vous recevez le produit automatiquement, à l'écran et par e-mail.", "Sobald die Zahlung bestätigt ist, erhältst du dein Produkt automatisch, auf dem Bildschirm und per E-Mail."],

    /* ---- Supporto e footer ---- */
    "sup.title": ["Hai domande? Ti rispondiamo su Discord.", "Got questions? We'll answer on Discord.", "¿Tienes preguntas? Te respondemos en Discord.", "Des questions ? On vous répond sur Discord.", "Fragen? Wir antworten auf Discord."],
    "sup.text": ["Entra nel server: trovi lo staff, le offerte esclusive e una community pronta ad aiutarti.", "Join the server: you'll find our staff, exclusive deals and a community ready to help.", "Entra en el servidor: encontrarás al staff, ofertas exclusivas y una comunidad lista para ayudarte.", "Rejoignez le serveur : vous y trouverez l'équipe, des offres exclusives et une communauté prête à vous aider.", "Tritt dem Server bei: Dort findest du unser Team, exklusive Angebote und eine Community, die dir gerne hilft."],
    "foot.about": ["Reselling di prodotti selezionati a prezzi competitivi, con supporto dedicato.", "Reselling of carefully selected products at competitive prices, with dedicated support.", "Reventa de productos seleccionados a precios competitivos, con soporte dedicado.", "Revente de produits sélectionnés à prix compétitifs, avec une assistance dédiée.", "Wiederverkauf ausgewählter Produkte zu wettbewerbsfähigen Preisen, mit persönlichem Support."],
    "foot.nav": ["Navigazione", "Navigation", "Navegación", "Navigation", "Navigation"],
    "foot.terms": ["Termini di servizio", "Terms of service", "Términos de servicio", "Conditions d'utilisation", "Nutzungsbedingungen"],
    "foot.privacy": ["Privacy", "Privacy", "Privacidad", "Confidentialité", "Datenschutz"],
    "foot.rights": ["Tutti i diritti riservati.", "All rights reserved.", "Todos los derechos reservados.", "Tous droits réservés.", "Alle Rechte vorbehalten."],
    "foot.disclaimer": ["Empire Shop non è affiliato a Discord.", "Empire Shop is not affiliated with Discord.", "Empire Shop no está afiliado a Discord.", "Empire Shop n'est pas affilié à Discord.", "Empire Shop ist nicht mit Discord verbunden."],

    /* ---- Carrello ---- */
    "cart.aria": ["Carrello", "Cart", "Carrito", "Panier", "Warenkorb"],
    "cart.title": ["Il tuo carrello", "Your cart", "Tu carrito", "Votre panier", "Dein Warenkorb"],
    "cart.close": ["Chiudi il carrello", "Close the cart", "Cerrar el carrito", "Fermer le panier", "Warenkorb schließen"],
    "cart.total": ["Totale", "Total", "Total", "Total", "Gesamt"],
    "cart.checkout": ["Completa l'ordine su Discord", "Complete the order on Discord", "Completa el pedido en Discord", "Finaliser la commande sur Discord", "Bestellung auf Discord abschließen"],
    "cart.note": ["Il riepilogo viene copiato negli appunti: incollalo nel ticket su Discord.", "The summary is copied to your clipboard: paste it into the ticket on Discord.", "El resumen se copia al portapapeles: pégalo en el ticket de Discord.", "Le récapitulatif est copié dans le presse-papiers : collez-le dans le ticket sur Discord.", "Die Übersicht wird in die Zwischenablage kopiert: Füge sie im Ticket auf Discord ein."],
    "cart.empty": ["Il carrello è vuoto.<br />Aggiungi un prodotto dal catalogo.", "Your cart is empty.<br />Add a product from the catalog.", "El carrito está vacío.<br />Añade un producto del catálogo.", "Votre panier est vide.<br />Ajoutez un produit du catalogue.", "Dein Warenkorb ist leer.<br />Füge ein Produkt aus dem Katalog hinzu."],
    "cart.dec": ["Diminuisci", "Decrease", "Disminuir", "Diminuer", "Verringern"],
    "cart.inc": ["Aumenta", "Increase", "Aumentar", "Augmenter", "Erhöhen"],
    "cart.remove": ["Rimuovi", "Remove", "Quitar", "Retirer", "Entfernen"],
    "cart.maxQty": ["Hai raggiunto la quantità disponibile", "You've reached the available quantity", "Has alcanzado la cantidad disponible", "Vous avez atteint la quantité disponible", "Du hast die verfügbare Menge erreicht"],
    "cart.added": ["{name} aggiunto al carrello", "{name} added to the cart", "{name} añadido al carrito", "{name} ajouté au panier", "{name} wurde in den Warenkorb gelegt"],
    "cart.copied": ["Riepilogo copiato: incollalo nel ticket su Discord", "Summary copied: paste it into the ticket on Discord", "Resumen copiado: pégalo en el ticket de Discord", "Récapitulatif copié : collez-le dans le ticket sur Discord", "Übersicht kopiert: Füge sie im Ticket auf Discord ein"],
    "cart.openTicket": ["Apri un ticket su Discord con il tuo ordine", "Open a ticket on Discord with your order", "Abre un ticket en Discord con tu pedido", "Ouvrez un ticket sur Discord avec votre commande", "Eröffne ein Ticket auf Discord mit deiner Bestellung"],
    "order.title": ["Ordine Empire Shop", "Empire Shop order", "Pedido Empire Shop", "Commande Empire Shop", "Empire-Shop-Bestellung"],
    "order.customer": ["Cliente", "Customer", "Cliente", "Client", "Kunde"],

    /* ---- Messaggi dopo l'accesso ---- */
    "toast.resetSent": ["Se l'email è registrata, ti abbiamo inviato il link per scegliere una nuova password", "If the email is registered, we've sent you a link to choose a new password", "Si el correo está registrado, te hemos enviado un enlace para elegir una nueva contraseña", "Si l'e-mail est enregistrée, nous vous avons envoyé un lien pour choisir un nouveau mot de passe", "Wenn die E-Mail-Adresse registriert ist, haben wir dir einen Link zum Festlegen eines neuen Passworts geschickt"],
    "toast.logout": ["Sei uscito dal tuo account", "You've logged out", "Has cerrado sesión", "Vous êtes déconnecté", "Du wurdest abgemeldet"],
    "toast.welcomeFounder": ["Bentornato Founder, {name}", "Welcome back, Founder {name}", "Bienvenido de nuevo, Founder {name}", "Bon retour, Founder {name}", "Willkommen zurück, Founder {name}"],
    "toast.welcome": ["Ciao {name}, buono shopping!", "Hi {name}, happy shopping!", "¡Hola {name}, felices compras!", "Salut {name}, bon shopping !", "Hallo {name}, viel Spaß beim Einkaufen!"],

    /* ---- Pannello Founder ---- */
    "panel.title": ["Pannello di controllo", "Control panel", "Panel de control", "Panneau de contrôle", "Kontrollzentrum"],
    "panel.text": ["Gestisci le card del catalogo e controlla chi accede al sito.", "Manage the catalog cards and see who accesses the site.", "Gestiona las tarjetas del catálogo y controla quién accede al sitio.", "Gérez les cartes du catalogue et contrôlez qui accède au site.", "Verwalte die Katalogkarten und sieh, wer auf die Website zugreift."],
    "panel.close": ["Chiudi il pannello", "Close the panel", "Cerrar el panel", "Fermer le panneau", "Panel schließen"],
    "panel.tabProducts": ["Card prodotti", "Product cards", "Tarjetas de producto", "Cartes produit", "Produktkarten"],
    "panel.tabAccess": ["Accessi", "Logins", "Accesos", "Connexions", "Zugriffe"],
    "panel.tabUsers": ["Utenti", "Users", "Usuarios", "Utilisateurs", "Nutzer"],
    "panel.prodSearchPh": ["Cerca per nome o categoria", "Search by name or category", "Buscar por nombre o categoría", "Rechercher par nom ou catégorie", "Nach Name oder Kategorie suchen"],
    "panel.newCard": ["Nuova card", "New card", "Nueva tarjeta", "Nouvelle carte", "Neue Karte"],
    "panel.accessSearchPh": ["Cerca per utente, email o IP", "Search by user, email or IP", "Buscar por usuario, correo o IP", "Rechercher par utilisateur, e-mail ou IP", "Nach Nutzer, E-Mail oder IP suchen"],
    "panel.userSearchPh": ["Cerca per nome o email", "Search by name or email", "Buscar por nombre o correo", "Rechercher par nom ou e-mail", "Nach Name oder E-Mail suchen"],
    "panel.refresh": ["Aggiorna", "Refresh", "Actualizar", "Actualiser", "Aktualisieren"],
    "stat.users": ["Utenti registrati", "Registered users", "Usuarios registrados", "Utilisateurs inscrits", "Registrierte Nutzer"],
    "stat.today": ["Accessi oggi", "Logins today", "Accesos hoy", "Connexions aujourd'hui", "Zugriffe heute"],
    "stat.cards": ["Card nel catalogo", "Cards in the catalog", "Tarjetas en el catálogo", "Cartes dans le catalogue", "Karten im Katalog"],
    "stat.out": ["Card esaurite", "Sold-out cards", "Tarjetas agotadas", "Cartes épuisées", "Ausverkaufte Karten"],
    "stat.banned": ["Utenti bloccati", "Blocked users", "Usuarios bloqueados", "Utilisateurs bloqués", "Gesperrte Nutzer"],
    "th.product": ["Prodotto", "Product", "Producto", "Produit", "Produkt"],
    "th.price": ["Prezzo", "Price", "Precio", "Prix", "Preis"],
    "th.stock": ["Disponibili", "In stock", "Disponibles", "Disponibles", "Verfügbar"],
    "th.badge": ["Etichetta", "Label", "Etiqueta", "Étiquette", "Label"],
    "th.user": ["Utente", "User", "Usuario", "Utilisateur", "Nutzer"],
    "th.email": ["Email", "Email", "Correo", "E-mail", "E-Mail"],
    "th.when": ["Data e ora", "Date and time", "Fecha y hora", "Date et heure", "Datum und Uhrzeit"],
    "th.ip": ["Indirizzo IP", "IP address", "Dirección IP", "Adresse IP", "IP-Adresse"],
    "th.device": ["Dispositivo", "Device", "Dispositivo", "Appareil", "Gerät"],
    "th.role": ["Ruolo", "Role", "Rol", "Rôle", "Rolle"],
    "th.status": ["Stato", "Status", "Estado", "Statut", "Status"],
    "th.registered": ["Registrato il", "Registered on", "Registrado el", "Inscrit le", "Registriert am"],
    "th.lastAccess": ["Ultimo accesso", "Last login", "Último acceso", "Dernière connexion", "Letzter Zugriff"],
    "empty.cards": ["Nessuna card trovata.", "No cards found.", "No se encontraron tarjetas.", "Aucune carte trouvée.", "Keine Karten gefunden."],
    "empty.access": ["Ancora nessun accesso registrato.", "No logins recorded yet.", "Aún no hay accesos registrados.", "Aucune connexion enregistrée pour l'instant.", "Noch keine Zugriffe erfasst."],
    "empty.users": ["Nessun utente trovato.", "No users found.", "No se encontraron usuarios.", "Aucun utilisateur trouvé.", "Keine Nutzer gefunden."],
    "btn.edit": ["Modifica", "Edit", "Editar", "Modifier", "Bearbeiten"],
    "btn.delete": ["Elimina", "Delete", "Eliminar", "Supprimer", "Löschen"],
    "btn.block": ["Blocca", "Block", "Bloquear", "Bloquer", "Sperren"],
    "btn.unblock": ["Sblocca", "Unblock", "Desbloquear", "Débloquer", "Entsperren"],
    "status.active": ["Attivo", "Active", "Activo", "Actif", "Aktiv"],
    "status.banned": ["Bloccato", "Blocked", "Bloqueado", "Bloqué", "Gesperrt"],
    "confirm.delete": [`Eliminare la card "{name}"? L'operazione non si può annullare.`, `Delete the card "{name}"? This can't be undone.`, `¿Eliminar la tarjeta "{name}"? Esta acción no se puede deshacer.`, `Supprimer la carte « {name} » ? Cette action est irréversible.`, `Die Karte „{name}“ löschen? Das kann nicht rückgängig gemacht werden.`],
    "confirm.block": ["Bloccare l'accesso a {name}? Non potrà più entrare finché non lo sblocchi.", "Block access for {name}? They won't be able to log in until you unblock them.", "¿Bloquear el acceso a {name}? No podrá entrar hasta que lo desbloquees.", "Bloquer l'accès à {name} ? Cette personne ne pourra plus se connecter tant que vous ne la débloquez pas.", "Zugriff für {name} sperren? Die Person kann sich erst wieder anmelden, wenn du sie entsperrst."],
    "toast.cardDeleted": ["Card eliminata", "Card deleted", "Tarjeta eliminada", "Carte supprimée", "Karte gelöscht"],
    "toast.userBlocked": ["Utente bloccato", "User blocked", "Usuario bloqueado", "Utilisateur bloqué", "Nutzer gesperrt"],
    "toast.userUnblocked": ["Utente sbloccato", "User unblocked", "Usuario desbloqueado", "Utilisateur débloqué", "Nutzer entsperrt"],
    "toast.cardUpdated": ["Card aggiornata", "Card updated", "Tarjeta actualizada", "Carte mise à jour", "Karte aktualisiert"],
    "toast.cardPublished": ["Card pubblicata nel catalogo", "Card published in the catalog", "Tarjeta publicada en el catálogo", "Carte publiée dans le catalogue", "Karte im Katalog veröffentlicht"],

    /* ---- Editor delle card ---- */
    "ed.edit": ["Modifica card", "Edit card", "Editar tarjeta", "Modifier la carte", "Karte bearbeiten"],
    "ed.preview": ["Anteprima", "Preview", "Vista previa", "Aperçu", "Vorschau"],
    "ed.namePh": ["Es. Felpa Empire nera", "E.g. Black Empire hoodie", "Ej. Sudadera Empire negra", "Ex. Sweat Empire noir", "z. B. Schwarzer Empire-Hoodie"],
    "ed.category": ["Categoria", "Category", "Categoría", "Catégorie", "Kategorie"],
    "ed.categoryPh": ["Es. Streetwear", "E.g. Streetwear", "Ej. Streetwear", "Ex. Streetwear", "z. B. Streetwear"],
    "ed.price": ["Prezzo (€)", "Price (€)", "Precio (€)", "Prix (€)", "Preis (€)"],
    "ed.oldPrice": ["Prezzo barrato (€)", "Old price (€)", "Precio tachado (€)", "Prix barré (€)", "Durchgestrichener Preis (€)"],
    "ed.optional": ["Facoltativo", "Optional", "Opcional", "Facultatif", "Optional"],
    "ed.stock": ["Disponibilità", "Availability", "Disponibilidad", "Disponibilité", "Verfügbarkeit"],
    "ed.none": ["Nessuna", "None", "Ninguna", "Aucune", "Keine"],
    "ed.image": ["Immagine", "Image", "Imagen", "Image", "Bild"],
    "ed.upload": ["Trascina un'immagine o clicca per sceglierla", "Drag an image or click to choose one", "Arrastra una imagen o haz clic para elegirla", "Glissez une image ou cliquez pour la choisir", "Ziehe ein Bild hierher oder klicke, um eines auszuwählen"],
    "ed.uploaded": ["Immagine caricata. Clicca per cambiarla", "Image uploaded. Click to change it", "Imagen cargada. Haz clic para cambiarla", "Image chargée. Cliquez pour la changer", "Bild hochgeladen. Klicke, um es zu ändern"],
    "ed.uploadedFile": ["{file} caricata", "{file} uploaded", "{file} cargada", "{file} chargée", "{file} hochgeladen"],
    "ed.imageUrl": ["Oppure link immagine", "Or image link", "O enlace de imagen", "Ou lien de l'image", "Oder Bildlink"],
    "ed.cancel": ["Annulla", "Cancel", "Cancelar", "Annuler", "Abbrechen"],
    "ed.save": ["Salva card", "Save card", "Guardar tarjeta", "Enregistrer la carte", "Karte speichern"],
    "ed.err.name": ["Dai un nome al prodotto.", "Give the product a name.", "Ponle un nombre al producto.", "Donnez un nom au produit.", "Gib dem Produkt einen Namen."],
    "ed.err.cat": ["Indica una categoria.", "Specify a category.", "Indica una categoría.", "Indiquez une catégorie.", "Gib eine Kategorie an."],
    "ed.err.price": ["Inserisci un prezzo maggiore di zero.", "Enter a price greater than zero.", "Introduce un precio mayor que cero.", "Saisissez un prix supérieur à zéro.", "Gib einen Preis größer als null ein."],
    "ed.err.old": ["Il prezzo barrato deve essere più alto del prezzo.", "The old price must be higher than the price.", "El precio tachado debe ser mayor que el precio.", "Le prix barré doit être supérieur au prix.", "Der durchgestrichene Preis muss höher sein als der Preis."],

    /* ---- Dettaglio prodotto ---- */
    "card.details": ["Vedi i dettagli di {name}", "See the details of {name}", "Ver los detalles de {name}", "Voir les détails de {name}", "Details zu {name} ansehen"],
    "card.auto": ["Consegna automatica", "Instant delivery", "Entrega automática", "Livraison automatique", "Sofortige Lieferung"],
    "pm.desc": ["Descrizione", "Description", "Descripción", "Description", "Beschreibung"],
    "pm.noDesc": ["Nessuna descrizione per questo prodotto.", "No description for this product.", "Este producto no tiene descripción.", "Aucune description pour ce produit.", "Für dieses Produkt gibt es keine Beschreibung."],
    "pm.add": ["Aggiungi al carrello", "Add to cart", "Añadir al carrito", "Ajouter au panier", "In den Warenkorb"],
    "pm.buy": ["Compra ora", "Buy now", "Comprar ahora", "Acheter maintenant", "Jetzt kaufen"],
    "pm.autoNote": ["Dopo il pagamento ricevi il prodotto in automatico: compare subito nella finestra di pagamento e ti arriva via email.", "After payment you get the product automatically: it appears right away in the payment window and is sent to your email.", "Tras el pago recibes el producto automáticamente: aparece al momento en la ventana de pago y te llega por correo.", "Après le paiement, vous recevez le produit automatiquement : il s'affiche aussitôt dans la fenêtre de paiement et arrive par e-mail.", "Nach der Zahlung erhältst du das Produkt automatisch: Es erscheint sofort im Zahlungsfenster und kommt per E-Mail."],
    "pm.discordNote": ["Questo prodotto si ordina tramite lo staff su Discord: aggiungilo al carrello e completa l'ordine.", "This product is ordered through our staff on Discord: add it to the cart and complete the order.", "Este producto se pide a través del staff en Discord: añádelo al carrito y completa el pedido.", "Ce produit se commande auprès de l'équipe sur Discord : ajoutez-le au panier et finalisez la commande.", "Dieses Produkt wird über unser Team auf Discord bestellt: Lege es in den Warenkorb und schließe die Bestellung ab."],

    /* ---- Pagamento SellAuth ---- */
    "cart.pay": ["Paga ora", "Pay now", "Pagar ahora", "Payer maintenant", "Jetzt bezahlen"],
    "cart.payNote": ["Pagamento sicuro con SellAuth. Dopo il pagamento ricevi il prodotto in automatico, anche via email.", "Secure payment with SellAuth. After payment you get the product automatically, by email too.", "Pago seguro con SellAuth. Tras el pago recibes el producto automáticamente, también por correo.", "Paiement sécurisé avec SellAuth. Après le paiement, vous recevez le produit automatiquement, aussi par e-mail.", "Sichere Zahlung mit SellAuth. Nach der Zahlung erhältst du das Produkt automatisch, auch per E-Mail."],
    "cart.mixedNote": ["Alcuni prodotti nel carrello si ordinano solo su Discord: il riepilogo viene copiato negli appunti.", "Some products in your cart can only be ordered on Discord: the summary is copied to your clipboard.", "Algunos productos del carrito solo se pueden pedir en Discord: el resumen se copia al portapapeles.", "Certains produits du panier se commandent uniquement sur Discord : le récapitulatif est copié dans le presse-papiers.", "Einige Produkte im Warenkorb können nur auf Discord bestellt werden: Die Übersicht wird in die Zwischenablage kopiert."],
    "pay.unavailable": ["Il pagamento non è disponibile in questo momento. Riprova tra poco o scrivici su Discord.", "Payment isn't available right now. Try again shortly or message us on Discord.", "El pago no está disponible en este momento. Inténtalo en un rato o escríbenos en Discord.", "Le paiement n'est pas disponible pour le moment. Réessayez bientôt ou écrivez-nous sur Discord.", "Die Zahlung ist gerade nicht verfügbar. Versuche es gleich noch einmal oder schreib uns auf Discord."],
    "pay.success": ["Pagamento completato! Il prodotto ti è stato consegnato: lo trovi nella finestra di pagamento e nella tua email.", "Payment complete! Your product has been delivered: you'll find it in the payment window and in your email.", "¡Pago completado! Tu producto ha sido entregado: lo encontrarás en la ventana de pago y en tu correo.", "Paiement effectué ! Votre produit a été livré : vous le trouverez dans la fenêtre de paiement et dans votre e-mail.", "Zahlung abgeschlossen! Dein Produkt wurde geliefert: Du findest es im Zahlungsfenster und in deiner E-Mail."],
    "pay.error": ["Il pagamento non è andato a buon fine. Riprova.", "The payment didn't go through. Please try again.", "El pago no se ha completado. Inténtalo de nuevo.", "Le paiement n'a pas abouti. Réessayez.", "Die Zahlung ist fehlgeschlagen. Bitte versuche es erneut."],

    /* ---- Editor: descrizione e SellAuth ---- */
    "ed.desc": ["Descrizione", "Description", "Descripción", "Description", "Beschreibung"],
    "ed.descPh": ["Cosa contiene, come si usa, requisiti... Il cliente la vede quando clicca sulla card.", "What's included, how to use it, requirements... Customers see it when they click the card.", "Qué incluye, cómo se usa, requisitos... El cliente la ve al hacer clic en la tarjeta.", "Contenu, utilisation, prérequis... Le client la voit en cliquant sur la carte.", "Inhalt, Nutzung, Voraussetzungen... Kunden sehen sie, wenn sie auf die Karte klicken."],
    "ed.sellauth": ["SellAuth · consegna automatica", "SellAuth · instant delivery", "SellAuth · entrega automática", "SellAuth · livraison automatique", "SellAuth · sofortige Lieferung"],
    "ed.saHint": ["Collega la card a un prodotto SellAuth: il cliente paga sul sito e riceve subito quello che hai caricato su SellAuth (chiavi, account, file o testo). Gli ID sono in dash.sellauth.com → Prodotti. Senza ID variante, la variante la sceglie il cliente al pagamento. Lascia vuoto per vendere tramite Discord.", "Link the card to a SellAuth product: customers pay on the site and instantly get what you uploaded to SellAuth (keys, accounts, files or text). IDs are in dash.sellauth.com → Products. Without a variant ID, customers pick the variant at checkout. Leave empty to sell through Discord.", "Vincula la tarjeta a un producto de SellAuth: el cliente paga en la web y recibe al instante lo que subiste a SellAuth (claves, cuentas, archivos o texto). Los ID están en dash.sellauth.com → Productos. Sin ID de variante, el cliente elige la variante al pagar. Déjalo vacío para vender por Discord.", "Liez la carte à un produit SellAuth : le client paie sur le site et reçoit aussitôt ce que vous avez chargé sur SellAuth (clés, comptes, fichiers ou texte). Les ID sont dans dash.sellauth.com → Produits. Sans ID de variante, le client choisit la variante au paiement. Laissez vide pour vendre via Discord.", "Verknüpfe die Karte mit einem SellAuth-Produkt: Kunden zahlen auf der Seite und erhalten sofort, was du bei SellAuth hochgeladen hast (Keys, Accounts, Dateien oder Text). Die IDs findest du unter dash.sellauth.com → Produkte. Ohne Varianten-ID wählt der Kunde die Variante beim Bezahlen. Leer lassen, um über Discord zu verkaufen."],
    "ed.saOff": ["SellAuth non è ancora attivo sul sito: inserisci shopId e shopUrl in js/config.js. Fino ad allora gli ordini passano da Discord.", "SellAuth isn't active on the site yet: set shopId and shopUrl in js/config.js. Until then orders go through Discord.", "SellAuth aún no está activo en la web: indica shopId y shopUrl en js/config.js. Hasta entonces los pedidos pasan por Discord.", "SellAuth n'est pas encore actif sur le site : renseignez shopId et shopUrl dans js/config.js. D'ici là, les commandes passent par Discord.", "SellAuth ist auf der Seite noch nicht aktiv: Trage shopId und shopUrl in js/config.js ein. Bis dahin laufen Bestellungen über Discord."],
    "ed.saProduct": ["ID prodotto SellAuth", "SellAuth product ID", "ID de producto SellAuth", "ID produit SellAuth", "SellAuth-Produkt-ID"],
    "ed.saVariant": ["ID variante", "Variant ID", "ID de variante", "ID de variante", "Varianten-ID"],
    "ed.err.saId": ["Gli ID SellAuth devono essere numeri.", "SellAuth IDs must be numbers.", "Los ID de SellAuth deben ser números.", "Les ID SellAuth doivent être des nombres.", "SellAuth-IDs müssen Zahlen sein."],
    "ed.err.saVariant": ["Per usare l'ID variante inserisci anche l'ID prodotto.", "To use the variant ID, also enter the product ID.", "Para usar el ID de variante indica también el ID de producto.", "Pour utiliser l'ID de variante, saisissez aussi l'ID produit.", "Um die Varianten-ID zu nutzen, gib auch die Produkt-ID ein."],
    "th.sellauth": ["SellAuth", "SellAuth", "SellAuth", "SellAuth", "SellAuth"],

    /* ---- Errori del backend ---- */
    "err.demo-reset": ["In modalità demo la password non si può recuperare: gli account esistono solo in questo browser. Collega Firebase (vedi README) per il recupero via email.", "In demo mode the password can't be recovered: accounts only exist in this browser. Connect Firebase (see README) to enable email recovery.", "En modo demo no se puede recuperar la contraseña: las cuentas solo existen en este navegador. Conecta Firebase (ver README) para recuperarla por correo.", "En mode démo, le mot de passe ne peut pas être récupéré : les comptes n'existent que dans ce navigateur. Connectez Firebase (voir README) pour la récupération par e-mail.", "Im Demo-Modus kann das Passwort nicht wiederhergestellt werden: Die Konten existieren nur in diesem Browser. Verbinde Firebase (siehe README), um die Wiederherstellung per E-Mail zu nutzen."],
    "err.email-in-use": ["Esiste già un account con questa email.", "An account with this email already exists.", "Ya existe una cuenta con este correo.", "Un compte existe déjà avec cet e-mail.", "Es gibt bereits ein Konto mit dieser E-Mail-Adresse."],
    "err.invalid-login": ["Email o password non corretti.", "Incorrect email or password.", "Correo o contraseña incorrectos.", "E-mail ou mot de passe incorrect.", "E-Mail oder Passwort ist falsch."],
    "err.weak-password": ["La password deve avere almeno 6 caratteri.", "The password must be at least 6 characters long.", "La contraseña debe tener al menos 6 caracteres.", "Le mot de passe doit contenir au moins 6 caractères.", "Das Passwort muss mindestens 6 Zeichen lang sein."],
    "err.invalid-email": ["L'indirizzo email non è valido.", "The email address is not valid.", "La dirección de correo no es válida.", "L'adresse e-mail n'est pas valide.", "Die E-Mail-Adresse ist ungültig."],
    "err.banned": ["Il tuo account è stato bloccato. Contatta lo staff su Discord.", "Your account has been blocked. Contact the staff on Discord.", "Tu cuenta ha sido bloqueada. Contacta con el staff en Discord.", "Votre compte a été bloqué. Contactez l'équipe sur Discord.", "Dein Konto wurde gesperrt. Wende dich auf Discord an das Team."],
    "err.not-allowed": ["Non hai i permessi per questa operazione.", "You don't have permission for this action.", "No tienes permisos para esta operación.", "Vous n'avez pas l'autorisation d'effectuer cette opération.", "Dir fehlt die Berechtigung für diese Aktion."],
    "err.network": ["Problema di connessione. Riprova tra poco.", "Connection problem. Please try again shortly.", "Problema de conexión. Inténtalo de nuevo en un momento.", "Problème de connexion. Réessayez dans un instant.", "Verbindungsproblem. Bitte versuche es gleich noch einmal."],
    "err.generic": ["Qualcosa non ha funzionato. Riprova.", "Something went wrong. Please try again.", "Algo ha fallado. Inténtalo de nuevo.", "Un problème est survenu. Réessayez.", "Etwas ist schiefgelaufen. Bitte versuche es erneut."],
    "err.firebase": ["Impossibile caricare Firebase", "Unable to load Firebase", "No se pudo cargar Firebase", "Impossible de charger Firebase", "Firebase konnte nicht geladen werden"]
  };

  /* ---------- Dizionario ---------- */
  const DICT = {};
  LANGS.forEach((l, i) => {
    DICT[l.code] = {};
    Object.keys(TEXTS).forEach((k) => { DICT[l.code][k] = TEXTS[k][i]; });
  });
  Object.keys(TEXTS).forEach((k) => {
    if (TEXTS[k].length !== LANGS.length) console.warn(`[i18n] "${k}": servono ${LANGS.length} traduzioni, ce ne sono ${TEXTS[k].length}`);
  });

  const isLang = (c) => LANGS.some((l) => l.code === c);
  const info = (c) => LANGS.find((l) => l.code === c) || LANGS[0];

  function pickInitial() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (isLang(saved)) return saved;
    } catch { /* storage non disponibile */ }
    const wanted = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""]);
    for (const w of wanted) {
      const c = String(w).slice(0, 2).toLowerCase();
      if (isLang(c)) return c;
    }
    return DEFAULT_LANG;
  }

  let current = pickInitial();
  const listeners = [];

  /* Traduce una chiave. I segnaposto {nome} vengono sostituiti con params.nome (testo già "sicuro"). */
  function t(key, params, lang) {
    const code = isLang(lang) ? lang : current;
    let s = DICT[code][key] ?? DICT[DEFAULT_LANG][key] ?? key;
    if (params) s = s.replace(/\{(\w+)\}/g, (m, k) => (params[k] !== undefined && params[k] !== null ? params[k] : m));
    return s;
  }

  /* ---------- Etichette delle card (Nuovo, Top, Hot, Offerta) ----------
     Nei dati restano salvate in italiano; a schermo appaiono nella lingua scelta.
     Le etichette personalizzate vengono mostrate così come sono. */
  const plain = (s) => String(s || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const BADGES = ["nuovo", "top", "hot", "offerta"];

  function badgeCanon(value) {
    const v = plain(value);
    if (!v) return String(value || "").trim();
    for (const b of BADGES) {
      if (LANGS.some((l) => plain(DICT[l.code]["badge." + b]) === v)) return DICT[DEFAULT_LANG]["badge." + b];
    }
    return String(value || "").trim();
  }
  function badge(value) {
    if (!value) return "";
    const canon = badgeCanon(value);
    const b = BADGES.find((x) => DICT[DEFAULT_LANG]["badge." + x] === canon);
    return b ? t("badge." + b) : String(value);
  }

  /* ---------- Applica le traduzioni alla pagina ---------- */
  function apply(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const i = pair.indexOf(":");
        if (i < 1) return;
        el.setAttribute(pair.slice(0, i).trim(), t(pair.slice(i + 1).trim()));
      });
    });
    if (root === document) {
      document.documentElement.lang = current;
      document.title = t("meta.title");
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", t("meta.desc"));
    }
  }

  /* ---------- Selettore lingua (compare in navbar e nella schermata di accesso) ---------- */
  /* Bandiere in miniatura (disegnate in SVG, nessun file esterno da caricare).
     Ogni bandiera usa id univoci perché lo stesso menù compare più volte nella pagina. */
  let flagN = 0;
  function flag(code) {
    const id = "fl" + (++flagN);
    const wrap = (inner, vb = "0 0 3 2") =>
      `<svg class="lang__flag" viewBox="${vb}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${inner}</svg>`;
    switch (code) {
      case "it":
        return wrap('<rect width="1" height="2" fill="#009246"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ce2b37"/>');
      case "fr":
        return wrap('<rect width="1" height="2" fill="#0055a4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ef4135"/>');
      case "de":
        return wrap('<rect width="3" height="0.667" fill="#000"/><rect y="0.667" width="3" height="0.667" fill="#dd0000"/><rect y="1.333" width="3" height="0.667" fill="#ffce00"/>');
      case "es":
        return wrap('<rect width="3" height="2" fill="#aa151b"/><rect y="0.5" width="3" height="1" fill="#f1bf00"/>');
      case "en":
        return wrap(
          `<clipPath id="${id}a"><path d="M0,0 v30 h60 v-30 z"/></clipPath>` +
          `<clipPath id="${id}b"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>` +
          `<g clip-path="url(#${id}a)"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/>` +
          '<path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>' +
          `<path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#${id}b)" stroke="#c8102e" stroke-width="4"/>` +
          '<path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>' +
          '<path d="M30,0 v30 M0,15 h60" stroke="#c8102e" stroke-width="6"/></g>', "0 0 60 30");
      default:
        return "";
    }
  }

  const GLOBE = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/></svg>';
  const CHEV = '<svg class="lang__chev" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></svg>';

  function buildSwitchers() {
    document.querySelectorAll("[data-lang-switch]").forEach((box) => {
      box.classList.add("lang");
      box.innerHTML =
        `<button type="button" class="lang__btn" aria-haspopup="listbox" aria-expanded="false"><span class="lang__cur"></span><span class="lang__code"></span>${CHEV}</button>` +
        `<ul class="lang__drop" role="listbox">${LANGS.map((l) =>
          `<li role="presentation"><button type="button" class="lang__opt" role="option" data-lang="${l.code}" lang="${l.code}">${flag(l.code)}<span class="lang__name">${l.name}</span><b>${l.code.toUpperCase()}</b></button></li>`
        ).join("")}</ul>`;
    });
    syncSwitchers();
  }

  function syncSwitchers() {
    document.querySelectorAll(".lang").forEach((box) => {
      $btn(box, ".lang__cur").innerHTML = flag(current);
      $btn(box, ".lang__code").textContent = current.toUpperCase();
      $btn(box, ".lang__btn").setAttribute("aria-label", `${t("lang.label")}: ${info(current).name}`);
      box.querySelectorAll(".lang__opt").forEach((o) => {
        const on = o.dataset.lang === current;
        o.classList.toggle("is-active", on);
        o.setAttribute("aria-selected", String(on));
      });
    });
  }
  const $btn = (box, sel) => box.querySelector(sel);

  function closeSwitchers(except) {
    document.querySelectorAll(".lang.is-open").forEach((box) => {
      if (box === except) return;
      box.classList.remove("is-open");
      $btn(box, ".lang__btn").setAttribute("aria-expanded", "false");
    });
  }

  document.addEventListener("click", (e) => {
    const opt = e.target.closest(".lang__opt");
    if (opt) { setLang(opt.dataset.lang); closeSwitchers(); return; }
    const btn = e.target.closest(".lang__btn");
    if (btn) {
      const box = btn.closest(".lang");
      const open = !box.classList.contains("is-open");
      closeSwitchers(box);
      box.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      return;
    }
    closeSwitchers();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSwitchers(); });

  /* ---------- Cambio lingua ---------- */
  function setLang(code) {
    if (!isLang(code) || code === current) return;
    current = code;
    try { localStorage.setItem(STORE_KEY, code); } catch { /* storage non disponibile */ }
    apply();
    syncSwitchers();
    listeners.forEach((cb) => cb(code));
  }

  buildSwitchers();
  apply();

  return {
    t, apply, setLang, badge, badgeCanon,
    get lang() { return current; },
    langs: LANGS,
    orderLang: ORDER_LANG,
    locale: (code) => info(isLang(code) ? code : current).locale,
    onChange: (cb) => listeners.push(cb)
  };
})();
