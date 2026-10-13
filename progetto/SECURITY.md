# Sicurezza — Empire Shop

## Cosa è stato fatto (e cosa NO)
- `firestore.rules` rafforzate: Founder riconosciuto solo con email **verificata**; profili e registro accessi accettano solo i campi previsti; tutto il resto è vietato.
- Password: minimo 8 caratteri; alla registrazione parte l'email di verifica.
- `firebase.json` / `_headers`: intestazioni di sicurezza attive (nosniff, anti-clickjacking, HSTS, referrer, permessi) e Content-Security-Policy in modalità **Report-Only**
  (non blocca nulla: apri la console del browser, controlla che non compaiano violazioni durante un acquisto di prova, poi rinomina
  `Content-Security-Policy-Report-Only` in `Content-Security-Policy`).
- Test dell'interfaccia in `tests/security_ui.py` (XSS e accesso al Pannello).

## Da fare tu (non automatizzabile da qui)
1. **Prima** di pubblicare le nuove regole: entra come Founder e premi "Invia email di verifica" nel Pannello, apri il link ricevuto.
2. Console Firebase → Firestore → Regole: incolla `firestore.rules` → Pubblica.
3. Console Firebase → Authentication → Impostazioni → Criteri password: richiedi almeno 8 caratteri (il controllo del sito da solo si può aggirare).
4. Console Firebase → Authentication → Domini autorizzati: lascia solo il tuo dominio e localhost.
5. Console Google Cloud → Credenziali → limita la API key Firebase ai tuoi domini (referrer HTTP).
6. Attiva i backup/esportazioni Firestore programmati (richiede il piano Blaze).
7. 2FA per il Founder: Firebase la offre solo con Identity Platform (a pagamento). Usa intanto una password lunga e unica.

## Vulnerabilità ancora aperte / limiti
- Non esiste un tuo server: rate limiting e blocco tentativi dipendono da quello integrato di Firebase Auth.
- Lo script three.js e quello di SellAuth arrivano da CDN esterni (SellAuth non permette il controllo d'integrità).
- Il registro accessi salva IP e dispositivo ottenuti da servizi esterni: l'IP è fornito dal browser, quindi non è affidabile, e va dichiarato nell'informativa privacy (GDPR).
- La API key SellAuth incollata nel Pannello resta nel browser del Founder finché non attivi il proxy Cloudflare (vedi `PROXY.md`). Con il proxy attivo la chiave sta solo su Cloudflare.
- Le regole Firestore non sono state eseguite con l'emulatore: provale con `firebase emulators:start` prima di fidarti.
