/* Barra promo in alto: il nome del mese si aggiorna da solo (ottobre → novembre → ...) */
(() => {
  const bar = document.getElementById("promo");
  if (!bar) return;
  const TXT = {
    it: ["PREZZI", "GIÙ", "SCONTI"], en: ["PRICE", "DROP", "DISCOUNTS"], es: ["PRECIOS", "BAJOS", "DESCUENTOS"],
    fr: ["PRIX", "EN BAISSE", "REMISES"], de: ["PREIS", "SENKUNG", "RABATTE"]
  };
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  function render() {
    const lang = (typeof I18N !== "undefined" && I18N.lang) || "it";
    const t = TXT[lang] || TXT.en;
    let month;
    try { month = new Intl.DateTimeFormat(lang, { month: "long" }).format(new Date()); } catch { month = ""; }
    set("promoMonth", month.toUpperCase());
    set("promoA", t[0]); set("promoB", t[1]); set("promoC", t[2]);
  }
  /* Adatta la barra allo spazio vero: in ogni lingua le parole hanno lunghezze diverse.
     Prima si tolgono le parole laterali, poi le illustrazioni; il centro (sacchetto + scritta) resta sempre. */
  const inner = bar.querySelector(".promo__in");
  const GAP_MIN = 30;                                    // spazio minimo tra un gruppo e l'altro
  function fit() {
    bar.classList.remove("promo--no-dim", "promo--no-art");
    if (bar.hidden || !inner) return;
    const cs = getComputedStyle(inner);
    const avail = inner.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const need = () => {
      const kids = [...inner.children].filter((el) => getComputedStyle(el).display !== "none");
      return kids.reduce((w, el) => w + el.getBoundingClientRect().width, 0) + GAP_MIN * Math.max(0, kids.length - 1);
    };
    if (need() <= avail) return;
    bar.classList.add("promo--no-dim");
    if (need() <= avail) return;
    bar.classList.add("promo--no-art");
  }
  let fitRaf = 0;
  const fitSoon = () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fit); };

  render();
  fit();
  if (typeof I18N !== "undefined" && I18N.onChange) I18N.onChange(() => { render(); fitSoon(); });
  window.addEventListener("resize", fitSoon);
  window.addEventListener("load", fitSoon);
  if (document.fonts) { document.fonts.ready.then(fitSoon); document.fonts.addEventListener?.("loadingdone", fitSoon); }

  const root = document.documentElement;
  const sync = () => {
    const h = bar.hidden ? 0 : bar.offsetHeight;
    root.style.setProperty("--promo-h", Math.max(0, h - window.scrollY) + "px");
  };
  window.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("resize", sync);
  document.getElementById("promoX").addEventListener("click", () => { bar.hidden = true; sync(); });
  window.addEventListener("load", sync);
  sync();
})();
