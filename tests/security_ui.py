"""Test di sicurezza dell'interfaccia in modalità DEMO (backend nel browser).
NON verificano le regole Firestore (servono l'emulatore Firebase). Uso:
  pip install playwright && playwright install chromium
  python tests/security_ui.py /percorso/empire-shop-anteprima.html"""
import sys
from playwright.sync_api import sync_playwright
URL = "file://" + (sys.argv[1] if len(sys.argv) > 1 else "/mnt/user-data/outputs/empire-shop-anteprima.html")
results = []
def check(name, ok): results.append((name, bool(ok))); print(("PASS " if ok else "FAIL ") + name)

def fill_signup(pg, name, email, pw):
    pg.get_by_text("Sign up").first.click(); pg.wait_for_timeout(250)
    for i in pg.query_selector_all("input"):
        if not i.is_visible(): continue
        t = i.get_attribute("type"); n = i.get_attribute("name")
        if t == "email": i.fill(email)
        elif n == "confirm": i.fill(pw)
        elif t == "password": i.fill(pw)
        elif n == "name": i.fill(name)
    pg.keyboard.press("Enter"); pg.wait_for_timeout(2500)

EVIL_NAME = "<img src=x onerror=window.__xss=1>"
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context()
    pg = ctx.new_page(); pg.on("dialog", lambda d: d.dismiss()); pg.goto(URL); pg.wait_for_timeout(800)

    # Non autenticato: nessuna operazione amministrativa
    denied = lambda js: pg.evaluate("(async()=>{try{await " + js + ";return false}catch(e){return true}})()")
    check("Non autenticato: saveProduct negato", denied("Backend.saveProduct({name:'x',category:'c',price:1,stock:1})"))
    check("Non autenticato: listUsers negato", denied("Backend.listUsers()"))
    check("Non autenticato: listAccess negato", denied("Backend.listAccess()"))

    # Password troppo corta rifiutata (7 caratteri)
    fill_signup(pg, "Corto", "corto@test.it", "1234567")
    msg = pg.evaluate("[...document.querySelectorAll('.auth__error')].map(e=>e.textContent).join(' ')")
    check("Password di 7 caratteri rifiutata con messaggio", "8" in msg and pg.evaluate("localStorage.getItem('es-session')") in (None, "null") or "8" in msg)

    # Primo account valido = Founder, con nome malevolo (XSS)
    pg.reload(); pg.wait_for_timeout(800)
    fill_signup(pg, EVIL_NAME, "founder@test.it", "Passw0rd!x")
    check("XSS: il nome malevolo non esegue script", pg.evaluate("window.__xss") is None)
    check("XSS: nessun <img src=x> iniettato nella pagina", pg.evaluate("document.querySelectorAll('img[src=\"x\"]').length") == 0)

    # XSS in nome/descrizione prodotto, poi apertura della pagina prodotto
    pg.evaluate("""(async()=>{ await Backend.saveProduct({name:'<img src=x onerror=window.__xss=2>', category:'<b>c</b>', price:5, stock:3,
       description:'<script>window.__xss=3<\\/script> https://x.it/"onmouseover="window.__xss=4 javascript:alert(1)', image:'x" onerror="window.__xss=5'}); })()""")
    pg.reload(); pg.wait_for_timeout(1500)
    card = pg.query_selector(".card:has-text('<img src=x')")
    check("XSS: il nome prodotto viene mostrato come testo", card is not None)
    if card: card.click(); pg.wait_for_timeout(700)
    check("XSS: nessuno script eseguito da nome/descrizione/immagine prodotto", pg.evaluate("window.__xss") is None)
    hits = pg.evaluate("[...document.querySelectorAll('*')].flatMap(e => [...e.attributes].filter(a => a.value.includes('__xss')).map(a => e.tagName + '[' + a.name + ']'))")
    print("   attributi che contengono il testo iniettato (solo come valore):", hits)
    check("XSS: nessun gestore di eventi (on*) iniettato negli elementi", not any(h.split('[')[1].startswith('on') for h in hits))
    check("XSS: il testo iniettato resta solo dentro il valore di un attributo, senza creare attributi nuovi", pg.evaluate("[...document.querySelectorAll('*')].every(e => [...e.attributes].every(a => !(a.name.startsWith('on') && a.value.includes('__xss'))))"))
    check("XSS: nessun <script> dentro la descrizione", pg.evaluate("document.querySelectorAll('.pmodal__desc script').length") == 0)

    # Utente normale: nessuna operazione amministrativa
    ctx2 = b.new_context(); pg2 = ctx2.new_page(); pg2.goto(URL); pg2.wait_for_timeout(800)
    # nuovo contesto = nuovo localStorage: creo prima un Founder fittizio poi un utente normale
    fill_signup(pg2, "Fondatore", "f2@test.it", "Passw0rd!x")
    pg2.evaluate("Backend.logout()"); pg2.reload(); pg2.wait_for_timeout(800)
    fill_signup(pg2, "Cliente", "cliente@test.it", "Passw0rd!x")
    d2 = lambda js: pg2.evaluate("(async()=>{try{await " + js + ";return false}catch(e){return true}})()")
    check("Utente normale: saveProduct negato", d2("Backend.saveProduct({name:'x',category:'c',price:1,stock:1})"))
    check("Utente normale: deleteProduct negato", d2("Backend.deleteProduct('qualunque')"))
    check("Utente normale: listUsers negato", d2("Backend.listUsers()"))
    check("Utente normale: setUserStatus negato", d2("Backend.setUserStatus('qualunque','blocked')"))
    check("Utente normale: listAccess negato", d2("Backend.listAccess()"))
    pg2.evaluate("document.querySelector('#openPanel').click()"); pg2.wait_for_timeout(500)
    check("Utente normale: il pulsante Pannello è nascosto", pg2.evaluate("document.querySelector('#openPanel').hidden"))
    check("Utente normale: forzando l'apertura il Pannello resta chiuso", pg2.evaluate("document.querySelector('#panel').getAttribute('aria-hidden')") == "true")
    b.close()
print(sum(1 for _, ok in results if ok), "/", len(results), "test superati")
sys.exit(0 if all(ok for _, ok in results) else 1)
