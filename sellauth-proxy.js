// PROXY CLOUDFLARE per l'importazione dei prodotti da SellAuth.
// - La API key resta SEGRETA su Cloudflare (il sito e il browser non la vedono mai).
// - Risponde solo a GET /products/<id> e restituisce SOLO i campi pubblici (nome, descrizione,
//   immagini, varianti con prezzo e stock): niente consegne, chiavi o dati dei clienti.
// - Se imposti ALLOWED_ORIGIN, accetta richieste solo dai tuoi siti.
//
// Installazione: vedi PROXY.md (5 minuti, dal browser, gratis).
// Variabili da impostare su Cloudflare:  SHOP_ID (testo) · SA_KEY (secret) · ALLOWED_ORIGIN (testo, facoltativo)

const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o && k in o).map((k) => [k, o[k]]));
const safeVariantKey = (k) => /^(id|name|price|stock|stock_count)$/.test(k) || /slash|old|compare|original/i.test(k);

export function clean(p) {
  const out = pick(p, ["id", "path", "name", "description", "price", "stock", "stock_count"]);
  out.images = (Array.isArray(p.images) ? p.images : []).map((i) => (typeof i === "string" ? i : pick(i, ["id", "url", "path"])));
  out.variants = (Array.isArray(p.variants) ? p.variants : []).map((v) => Object.fromEntries(Object.entries(v).filter(([k]) => safeVariantKey(k))));
  if (p.group) out.group = pick(p.group, ["id", "name"]);
  if (Array.isArray(p.groups)) out.groups = p.groups.map((g) => pick(g, ["id", "name"]));
  return out;
}

export default {
  async fetch(req, env) {
    const allowed = (env.ALLOWED_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
    const origin = req.headers.get("Origin") || "";
    const originOk = !allowed.length || allowed.includes(origin);
    const cors = {
      "Access-Control-Allow-Origin": allowed.length ? (originOk ? origin : "null") : "*",
      "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET, OPTIONS", "Vary": "Origin"
    };
    const json = (obj, status) => new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });

    if (req.method === "OPTIONS") return new Response(null, { status: originOk ? 204 : 403, headers: cors });
    if (!originOk) return json({ error: "origin non consentita" }, 403);
    const m = new URL(req.url).pathname.match(/^\/products\/(\d{1,12})$/);
    if (req.method !== "GET" || !m) return json({ error: "not found" }, 404);
    if (!env.SA_KEY || !env.SHOP_ID) return json({ error: "proxy non configurato" }, 500);

    const r = await fetch(`https://api.sellauth.com/v1/shops/${encodeURIComponent(env.SHOP_ID)}/products/${m[1]}`,
      { headers: { Authorization: `Bearer ${env.SA_KEY}`, Accept: "application/json" } });
    if (!r.ok) return json({ error: r.status }, r.status === 404 ? 404 : 502);
    const data = await r.json();
    return json(clean(data.data || data.product || data), 200);
  }
};
