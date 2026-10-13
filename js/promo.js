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
  render();
  if (typeof I18N !== "undefined" && I18N.onChange) I18N.onChange(render);

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
