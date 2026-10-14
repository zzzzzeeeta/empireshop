/* =========================================================
   EMPIRE SHOP — LOGICA
   1. Utility
   2. Loader
   3. Sfondo GIF, emblema del logo e particelle 3D
   4. Navbar e menu mobile
   5. Marquee reattivo allo scroll
   6. Prodotti, filtri e card 3D
   7. Carrello
   8. Reveal, contatori, tilt
   9. Accesso e registrazione
   10. Pannello Founder
   ========================================================= */

(() => {
  "use strict";

  /* ---------- 1. Utility ---------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;
  const tr = (key, params) => I18N.t(key, params);
  let euro, dateFmt;
  function refreshFormats() {
    const loc = I18N.locale();
    euro = new Intl.NumberFormat(loc, { style: "currency", currency: "EUR" });
    dateFmt = new Intl.DateTimeFormat(loc, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }
  refreshFormats();
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmtDate = (ms) => (ms ? dateFmt.format(new Date(ms)) : "—");

  const storage = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage non disponibile */ }
    }
  };

  let toastTimer;
  function toast(msg, ms = 2600) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-show"), ms);
  }

  /* ---------- Riordino con trascinamento: mouse, dito e tastiera (frecce) ----------
     Il contenitore resta fisso e cattura il puntatore; l'elemento trascinato si sposta nel DOM
     mentre una copia "fantasma" segue il dito/mouse. Ai bordi dello schermo scorre da sola. */
  function makeSortable(container, { item, handle, ghost, canStart, onDrop, wholeItemMouse = false }) {
    const items = () => [...container.querySelectorAll(item)];
    const idsNow = () => items().map((el) => el.dataset.id);
    const scrollParent = () => {
      for (let a = container; a && a !== document.body; a = a.parentElement) {
        if (/(auto|scroll)/.test(getComputedStyle(a).overflowY) && a.scrollHeight > a.clientHeight + 2) return a;
      }
      return null;
    };
    let drag = null, kbTimer = 0;

    function reorderAt(x, y) {
      const under = document.elementFromPoint(x, y);
      const target = under && under.closest(item);
      if (!target || target === drag.el || !container.contains(target)) return;
      const list = items();
      const after = list.indexOf(drag.el) < list.indexOf(target);
      target.parentNode.insertBefore(drag.el, after ? target.nextSibling : target);
    }
    function place() { drag.ghost.style.transform = `translate(${drag.x - drag.offX}px, ${drag.y - drag.offY}px)`; }
    function tick() {
      if (!drag || !drag.started) return;
      const r = drag.scroller ? drag.scroller.getBoundingClientRect() : { top: 0, bottom: innerHeight };
      const top = Math.max(r.top, 0), bottom = Math.min(r.bottom, innerHeight), edge = 70, max = 18;
      let dy = 0;
      if (drag.y < top + edge) dy = -max * Math.min(1, (top + edge - drag.y) / edge);
      else if (drag.y > bottom - edge) dy = max * Math.min(1, (drag.y - (bottom - edge)) / edge);
      if (dy) {
        if (drag.scroller) drag.scroller.scrollTop += dy; else window.scrollBy({ top: dy, behavior: "instant" });
        reorderAt(drag.x, drag.y);
      }
      drag.raf = requestAnimationFrame(tick);
    }
    function begin() {
      const rect = drag.el.getBoundingClientRect();
      const g = ghost ? ghost(drag.el) : drag.el.cloneNode(true);
      g.classList.add("drag-ghost");
      g.removeAttribute("id"); g.removeAttribute("data-id");
      g.style.width = rect.width + "px";
      if (!ghost) { g.style.height = rect.height + "px"; g.style.opacity = "1"; }
      document.body.appendChild(g);
      Object.assign(drag, { started: true, ghost: g, offX: drag.x0 - rect.left, offY: drag.y0 - rect.top, scroller: scrollParent(), before: idsNow().join() });
      drag.el.classList.add("is-dragging");
      document.body.classList.add("is-sort-drag");
      document.documentElement.style.overflowAnchor = "none";   // evita che il browser riallinei lo scroll quando la card cambia posto
      place();
      drag.raf = requestAnimationFrame(tick);
    }
    function finish(e) {
      if (!drag || (e && e.pointerId !== drag.id)) return;
      const d = drag; drag = null;
      cancelAnimationFrame(d.raf);
      try { container.releasePointerCapture(d.id); } catch { /* già rilasciato */ }
      if (!d.started) return;
      d.ghost.remove();
      d.el.classList.remove("is-dragging");
      document.body.classList.remove("is-sort-drag");
      document.documentElement.style.overflowAnchor = "";
      const ids = idsNow();
      if (ids.join() !== d.before) onDrop(ids);
    }

    container.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (canStart && !canStart()) return;
      const el = e.target.closest(item);
      if (!el || !container.contains(el) || e.target.closest("input, select, textarea")) return;
      const h = e.target.closest(handle);
      if (!(h && el.contains(h)) && !(wholeItemMouse && e.pointerType === "mouse")) return;
      if (h && h.disabled) return;
      e.preventDefault();
      drag = { el, id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, started: false };
      try { container.setPointerCapture(e.pointerId); } catch { /* ignora */ }
    });
    container.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      drag.x = e.clientX; drag.y = e.clientY;
      if (!drag.started) { if (Math.hypot(drag.x - drag.x0, drag.y - drag.y0) < 5) return; begin(); }
      place();
      reorderAt(drag.x, drag.y);
    });
    container.addEventListener("pointerup", finish);
    container.addEventListener("pointercancel", finish);
    container.addEventListener("dragstart", (e) => { if (e.target.closest && e.target.closest(item)) e.preventDefault(); });
    container.addEventListener("keydown", (e) => {
      const h = e.target.closest(handle);
      if (!h || h.disabled || (canStart && !canStart())) return;
      const dir = e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : 0;
      if (!dir) return;
      const el = h.closest(item);
      const sib = el && (dir < 0 ? el.previousElementSibling : el.nextElementSibling);
      if (!sib || !sib.matches(item)) return;
      e.preventDefault();
      if (dir < 0) sib.before(el); else sib.after(el);
      el.querySelector(handle)?.focus();
      clearTimeout(kbTimer);
      kbTimer = setTimeout(() => onDrop(idsNow()), 700);
    });
  }

  /* SellAuth è attivo solo con shopId e shopUrl compilati in js/config.js */
  const SA = (typeof SELLAUTH !== "undefined" && SELLAUTH) || {};
  const sellauthOn = Number(SA.shopId) > 0 && /^https?:\/\/\S+$/.test(SA.shopUrl || "");
  const isLinked = (p) => sellauthOn && Number(p?.sellauthProductId) > 0;

  /* Testo della descrizione: niente HTML, ma i link diventano cliccabili */
  const richText = (text) => esc(text).replace(/https?:\/\/[^\s<]*[^\s<.,;:!?)]/g,
    (u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`);

  $("#year").textContent = new Date().getFullYear();

  /* ---------- 2. Loader ---------- */
  const start = performance.now();
  window.addEventListener("load", () => {
    const wait = Math.max(0, 900 - (performance.now() - start));
    setTimeout(() => {
      $("#loader").classList.add("is-hidden");
      document.body.classList.add("is-loaded");
    }, wait);
  });

  /* ---------- Stato scroll condiviso ---------- */
  const scroll = { y: window.scrollY, last: window.scrollY, velocity: 0 };
  window.addEventListener("scroll", () => { scroll.y = window.scrollY; }, { passive: true });

  const mouse = { x: 0, y: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  /* ---------- 3. Sfondo GIF, emblema del logo e particelle 3D ---------- */
  const bg = $("#bg");
  const emblem = $("#emblem");

  let spin = 0;
  const tilt = { x: 0, y: 0 };

  function renderScene() {
    const vh = window.innerHeight;
    const heroP = Math.min(scroll.y / vh, 1);      // 0 → 1 durante l'hero
    const p = Math.min(scroll.y / vh, 4);

    // Sfondo: si attenua, si sfoca e si ingrandisce scorrendo
    bg.style.setProperty("--bg-o", (0.55 - Math.min(p / 1.4, 1) * 0.4).toFixed(3));
    bg.style.setProperty("--bg-blur", `${(heroP * 6).toFixed(1)}px`);
    bg.style.setProperty("--bg-s", (1 + heroP * 0.12).toFixed(3));
    bg.style.setProperty("--bg-y", `${(-scroll.y * 0.05).toFixed(1)}px`);

    // Emblema: segue il mouse, gira più forte quando scorri, poi si allontana
    if (!reduceMotion) spin += Math.min(Math.abs(scroll.velocity) * 0.35, 14) * Math.sign(scroll.velocity || 1);
    spin *= 0.94;
    const k = reduceMotion ? 0.3 : 1;   // inclinazione più leggera con movimento ridotto
    const m = reduceMotion ? 0 : 1;     // niente spostamento in profondità allo scroll
    tilt.x += ((-mouse.y * 14 * k) - tilt.x) * 0.08;
    tilt.y += ((mouse.x * 18 * k) - tilt.y) * 0.08;
    emblem.style.transform =
      `perspective(1200px) translate3d(0, ${(heroP * 120 * m).toFixed(1)}px, ${(-heroP * 300 * m).toFixed(1)}px) ` +
      `rotateX(${(tilt.x + heroP * 25).toFixed(2)}deg) rotateY(${(tilt.y + spin).toFixed(2)}deg) ` +
      `scale(${(1 - heroP * 0.2).toFixed(3)})`;
    emblem.style.opacity = (1 - heroP * 1.1).toFixed(3);

    render3D();
  }

  let render3D = () => {};

  if (window.THREE) {
    const canvas = $("#webgl");
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 10);

    // Particelle viola che danno profondità a tutta la pagina
    const COUNT = isTouch ? 600 : 1400;
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const particles = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xb48cff, size: 0.07, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    scene.add(particles);

    window.addEventListener("resize", () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    const clock = new THREE.Clock();
    render3D = () => {
      const t = clock.getElapsedTime();
      particles.position.y = scroll.y * 0.005;
      particles.rotation.y = t * 0.02 + mouse.x * 0.08;
      particles.rotation.x = mouse.y * 0.04;
      renderer.render(scene, camera);
    };
  }

  /* ---------- 4. Navbar ---------- */
  const nav = $("#nav");
  const burger = $("#burger");
  const navLinks = $("#navLinks");

  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!open));
    navLinks.classList.toggle("is-open", !open);
  });
  $$("a", navLinks).forEach((a) => a.addEventListener("click", () => {
    burger.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("is-open");
  }));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      $$("a", navLinks).forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------- 5. Marquee ---------- */
  const track = $("#marqueeTrack");
  const chunk = track.innerHTML;
  track.innerHTML = chunk.repeat(8);
  let marqueeX = 0;

  function moveMarquee() {
    const half = track.scrollWidth / 2;
    const speed = reduceMotion ? 0.6 : 1.2 + Math.min(Math.abs(scroll.velocity) * 0.25, 18);
    const dir = scroll.velocity < -0.5 ? -1 : 1;
    marqueeX -= speed * dir;
    if (marqueeX <= -half) marqueeX += half;
    if (marqueeX > 0) marqueeX -= half;
    track.style.transform = `translate3d(${marqueeX}px,0,0)`;
  }

  /* ---------- 6. Prodotti ---------- */
  let products = [];
  const grid = $("#productGrid");
  const filtersEl = $("#filters");
  const ALL = "__all__";   // categoria interna "Tutti" (il testo cambia con la lingua)
  let activeCat = ALL;
  let sorting = false;                      // modalità "Riordina card" (solo Founder)
  const sortBar = $("#sortBar"), sortToggle = $("#sortToggle"), sortHint = $("#sortHint");
  const findProduct = (id) => products.find((p) => String(p.id) === String(id));

  function renderFilters() {
    const categories = [ALL, ...new Set(products.map((p) => p.category).filter(Boolean))];
    if (!categories.includes(activeCat)) activeCat = ALL;
    filtersEl.innerHTML = categories.map((c) =>
      `<button class="chip${c === activeCat ? " is-active" : ""}" role="tab" aria-selected="${c === activeCat}" data-cat="${esc(c)}">${esc(c === ALL ? tr("prod.all") : c)}</button>`
    ).join("");
  }

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    if (sorting) setSorting(false);
    activeCat = btn.dataset.cat;
    renderFilters();
    renderProducts();
  });

  /* stock infinito: p.infinite === true → sempre disponibile */
  const isInf = (p) => p && p.infinite === true;
  const maxQty = (p) => (isInf(p) ? 99 : Number(p.stock) || 0);
  const stockLabel = (p, stock) => (isInf(p) ? tr("card.inf") : tr("card.stock", { n: stock }));

  function cardTemplate(p) {
    const stock = Number(p.stock) || 0;
    const out = !isInf(p) && stock <= 0;
    const media = p.image
      ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" />`
      : `<div class="card__cover"><span>♛</span></div>`;
    return `
      <article class="card" data-id="${esc(p.id)}">
        <div class="card__media">
          ${media}
          ${p.badge ? `<span class="card__badge">${esc(I18N.badge(p.badge))}</span>` : ""}
        </div>
        <div class="card__body">
          <span class="card__cat">${esc(p.category || tr("card.noCat"))}</span>
          <h3 class="card__title"><button type="button" class="card__open" data-open="${esc(p.id)}" aria-label="${esc(tr("card.details", { name: p.name }))}">${esc(p.name || tr("card.noName"))}</button></h3>
          <span class="card__delivery${isLinked(p) ? " is-auto" : ""}">${isLinked(p) ? tr("card.auto") : tr("common.fast")}</span>
          <div class="card__foot">
            <div class="card__price">
              ${p.oldPrice ? `<s>${euro.format(p.oldPrice)}</s>` : ""}
              <strong>${euro.format(Number(p.price) || 0)}</strong>
            </div>
            <span class="card__stock${out ? " is-out" : ""}">${out ? tr("card.out") : stockLabel(p, stock)}</span>
          </div>
        </div>
      </article>`;
  }

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const card = e.target;
      const i = Number(card.dataset.index) % 4;
      card.style.transitionDelay = `${i * 90}ms`;
      card.classList.add("is-in");
      setTimeout(() => { card.style.transitionDelay = ""; }, 1100 + i * 90);
      cardObserver.unobserve(card);
    });
  }, { threshold: 0.15 });

  /* Ricerca: ignora maiuscole e accenti, cerca in nome, categoria ed etichetta */
  const searchInput = $("#productSearch");
  const normalize = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let query = "";

  function highlight(text) {
    const safe = esc(text);
    if (!query) return safe;
    const norm = normalize(text);
    const idx = norm.indexOf(query);
    if (idx < 0 || norm.length !== text.length) return safe;
    return esc(text.slice(0, idx)) + "<mark>" + esc(text.slice(idx, idx + query.length)) + "</mark>" + esc(text.slice(idx + query.length));
  }

  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (sorting && searchInput.value.trim()) setSorting(false);
      query = normalize(searchInput.value.trim());
      $("#searchClear").hidden = !searchInput.value;
      renderProducts();
    }, 120);
  });
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchInput.value) { e.stopPropagation(); clearSearch(); }
  });
  function clearSearch() {
    searchInput.value = "";
    query = "";
    $("#searchClear").hidden = true;
    renderProducts();
    searchInput.focus();
  }
  $("#searchClear").addEventListener("click", clearSearch);

  function renderProducts() {
    let list = activeCat === ALL ? products : products.filter((p) => p.category === activeCat);
    if (query) list = list.filter((p) => [p.name, p.category, p.badge, I18N.badge(p.badge), p.description].some((f) => normalize(f).includes(query)));

    $("#searchCount").textContent = query ? (list.length === 1 ? tr("prod.result1") : tr("prod.resultN", { n: list.length })) : "";

    const emptyMsg = query
      ? tr("prod.emptySearch", { q: esc(searchInput.value.trim()), btn: `<button class="link-btn" data-clear-search>${tr("prod.showAll")}</button>` })
      : tr("prod.emptyCat");
    grid.innerHTML = list.length ? list.map(cardTemplate).join("") : `<p class="empty">${emptyMsg}</p>`;
    if (query) $$(".card__open", grid).forEach((t) => { t.innerHTML = highlight(t.textContent); });
    $$(".card", grid).forEach((card, i) => {
      card.dataset.index = i;
      cardObserver.observe(card);
      if (sorting) card.insertAdjacentHTML("afterbegin", `<button type="button" class="drag-handle drag-handle--card" aria-label="${esc(tr("sort.handle"))}" title="${esc(tr("sort.handle"))}">⠿</button>`);
      else if (!isTouch && !reduceMotion) addTilt(card, 12);
    });
  }

  function setSorting(on) {
    sorting = !!on && currentUser?.role === "founder";
    grid.classList.toggle("is-sorting", sorting);
    sortToggle.setAttribute("aria-pressed", String(sorting));
    sortToggle.dataset.i18n = sorting ? "sort.done" : "sort.start";
    sortToggle.textContent = tr(sorting ? "sort.done" : "sort.start");
    sortHint.hidden = !sorting;
    if (sorting) {
      // per riordinare serve tutta la lista: via filtri e ricerca
      activeCat = ALL; query = ""; searchInput.value = ""; $("#searchClear").hidden = true;
      renderFilters();
    }
    renderProducts();
  }
  sortToggle.addEventListener("click", () => setSorting(!sorting));

  /* salva il nuovo ordine (si aggiorna anche l'elenco in memoria, così catalogo e pannello restano uguali) */
  let saveQueue = Promise.resolve();
  function saveOrder(ids, from) {
    const pos = new Map(ids.map((id, i) => [String(id), i]));
    products.sort((a, b) => (pos.get(String(a.id)) ?? 1e9) - (pos.get(String(b.id)) ?? 1e9));
    saveQueue = saveQueue.then(async () => {
      try {
        await Backend.reorderProducts(ids);
        toast(tr("sort.saved"));
        if (from === "table") renderProducts();
        else if (panel.classList.contains("is-open")) renderProdTable();
      } catch (err) {
        toast(err.message);
        await loadProducts();
        if (panel.classList.contains("is-open")) renderProdTable();
      }
    });
  }
  makeSortable(grid, { item: ".card", handle: ".drag-handle", wholeItemMouse: true, canStart: () => sorting, onDrop: (ids) => saveOrder(ids, "grid") });

  async function loadProducts() {
    try { products = await Backend.getProducts(); }
    catch (err) { products = []; toast(err.message); }
    cart = cart.filter((i) => findProduct(i.id));
    renderFilters();
    renderProducts();
    renderCart();
    if (pmId !== null) findProduct(pmId) ? renderProductModal() : closeProduct();
  }

  grid.addEventListener("click", (e) => {
    if (sorting) return;
    if (e.target.closest("[data-clear-search]")) {
      if (activeCat !== ALL) { activeCat = ALL; renderFilters(); }
      return clearSearch();
    }
    const btn = e.target.closest("[data-add]");
    if (btn) return addToCart(btn.dataset.add);
    // clic in qualsiasi altro punto della card: apre il dettaglio
    const card = e.target.closest(".card");
    if (card && !e.target.closest("a")) openProduct(card.dataset.id);
  });

  /* ---------- Dettaglio prodotto ---------- */
  const pmodal = $("#productModal");
  let pmId = null, pmReturnFocus = null, pmQty = 1;

  function renderProductModal() {
    const p = findProduct(pmId);
    if (!p) return;
    const stock = Number(p.stock) || 0;
    const out = !isInf(p) && stock <= 0;
    const linked = isLinked(p);
    const media = p.image
      ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" />`
      : `<div class="card__cover"><span>♛</span></div>`;
    const QL = { it: "Quantità", en: "Quantity", es: "Cantidad", fr: "Quantité", de: "Menge" }[I18N.lang] || "Quantity";
    const price = `<div class="card__price pmodal__price">${p.oldPrice ? `<s>${euro.format(p.oldPrice)}</s>` : ""}<strong>${euro.format(Number(p.price) || 0)}</strong></div>`;
    $("#pmContent").innerHTML = `
      <div class="pmodal__top"><span class="card__cat">${esc(p.category || tr("card.noCat"))}</span>
        <h3 class="pmodal__title" id="pmTitle">${esc(p.name || tr("card.noName"))}</h3></div>
      <div class="pmodal__media">${media}${p.badge ? `<span class="card__badge">${esc(I18N.badge(p.badge))}</span>` : ""}</div>
      <aside class="pmodal__buy">
        <div class="pmodal__row">${price}<span class="pchip${out ? " is-out" : ""}">${out ? tr("card.out") : stockLabel(p, stock)}</span></div>
        <div class="pmodal__row pmodal__qty"><span>${QL}</span>
          <div class="qty"><button type="button" data-pm-q="-1" aria-label="-">−</button><b id="pmQty">1</b><button type="button" data-pm-q="1" aria-label="+">+</button></div></div>
        <div class="pmodal__actions">
          <button type="button" class="btn ${linked ? "btn--primary" : "btn--ghost"}" data-pm-add ${out || !linked ? "disabled" : ""}>${tr("pm.add")}</button>
          ${linked ? `<button type="button" class="btn btn--ghost" data-pm-buy ${out ? "disabled" : ""}>${tr("pm.buy")}</button>` : ""}
        </div>
        <p class="pmodal__note">${linked ? tr("pm.autoNote") : tr("pm.unavailable")}</p>
      </aside>
      <section class="pmodal__tabs"><h4 class="pmodal__label">${tr("pm.desc")}</h4>
        <div class="pmodal__desc">${p.description ? richText(p.description) : `<span class="pmodal__empty">${tr("pm.noDesc")}</span>`}</div></section>`;
  }

  function openProduct(id) {
    if (!findProduct(id)) return;
    pmId = id;
    pmQty = 1;
    pmReturnFocus = document.activeElement;
    renderProductModal();
    $("#pmContent").scrollTop = 0;
    pmodal.classList.add("is-open");
    pmodal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#pmClose").focus({ preventScroll: true }), 50);
  }
  function closeProduct() {
    if (pmId === null) return;
    pmId = null;
    pmodal.classList.remove("is-open");
    pmodal.setAttribute("aria-hidden", "true");
    if (!panel.classList.contains("is-open")) document.body.style.overflow = "";
    if (pmReturnFocus?.isConnected) pmReturnFocus.focus({ preventScroll: true });
  }
  $("#pmClose").addEventListener("click", closeProduct);
  pmodal.addEventListener("click", (e) => {
    if (e.target === pmodal) return closeProduct();
    const q = e.target.closest("[data-pm-q]");
    if (q) { const n = Math.min(99, Math.max(1, pmQty + Number(q.dataset.pmQ))); pmQty = n; $("#pmQty").textContent = n; return; }
    if (e.target.closest("[data-pm-add]")) { for (let i = 0; i < pmQty; i++) addToCart(pmId); return; }
    if (e.target.closest("[data-pm-buy]")) {
      const p = findProduct(pmId);
      if (p) payWithSellAuth([{ p, qty: pmQty }], false);
    }
  });

  /* ---------- Tilt 3D ---------- */
  function addTilt(el, max) {
    el.addEventListener("pointermove", (e) => {
      if (el.classList.contains("card") && !el.classList.contains("is-in")) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", `${x * 100}%`);
      el.style.setProperty("--my", `${y * 100}%`);
      el.style.transition = "transform .15s ease-out, box-shadow .5s, border-color .4s";
      el.style.transform = `perspective(1200px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateY(-6px)`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.transition = "transform .7s cubic-bezier(.2,.8,.2,1), box-shadow .5s, border-color .4s";
      el.style.transform = "";
    });
  }

  /* ---------- 7. Carrello ---------- */
  const CART_KEY = ((typeof DEMO_STORAGE !== "undefined" && DEMO_STORAGE) || "empire") + "-cart";
  let cart = storage.get(CART_KEY, []);
  const cartEl = $("#cart");
  const overlay = $("#overlay");

  function openCart() {
    cartEl.classList.add("is-open");
    overlay.classList.add("is-open");
    cartEl.setAttribute("aria-hidden", "false");
  }
  function closeCart() {
    cartEl.classList.remove("is-open");
    overlay.classList.remove("is-open");
    cartEl.setAttribute("aria-hidden", "true");
  }
  $("#cartOpen").addEventListener("click", openCart);
  $("#cartClose").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);

  function addToCart(id) {
    const p = findProduct(id);
    if (!p) return;
    if (!isLinked(p)) { toast(tr("pm.unavailable")); return; }
    const item = cart.find((i) => String(i.id) === String(id));
    if (item) {
      if (item.qty >= maxQty(p)) { toast(tr("cart.maxQty")); return; }
      item.qty++;
    } else cart.push({ id: p.id, qty: 1 });
    saveCart();
    toast(tr("cart.added", { name: p.name }));
    const count = $("#cartCount");
    count.classList.remove("bump");
    void count.offsetWidth;
    count.classList.add("bump");
  }

  function changeQty(id, delta) {
    const item = cart.find((i) => String(i.id) === String(id));
    const p = findProduct(id);
    if (!item || !p) return;
    item.qty = Math.min(item.qty + delta, maxQty(p));
    if (item.qty <= 0) cart = cart.filter((i) => i !== item);
    saveCart();
  }

  function saveCart() {
    storage.set(CART_KEY, cart);
    renderCart();
  }

  /* nel carrello restano solo prodotti collegati a SellAuth: tutto si paga con il checkout a tutta pagina */
  const cartRows = () => cart.map((i) => ({ i, p: findProduct(i.id) })).filter((r) => r.p && isLinked(r.p));

  const setI18n = (el, key) => { el.dataset.i18n = key; el.textContent = tr(key); };

  function renderCart() {
    const box = $("#cartItems");
    let total = 0, count = 0;
    const rows = cartRows();
    setI18n($("#checkout"), "pm.buy");
    setI18n($("#cartNote"), "cart.payNote");
    if (!rows.length) {
      box.innerHTML = `<p class="cart__empty">${tr("cart.empty")}</p>`;
    } else {
      box.innerHTML = rows.map(({ i, p }) => {
        total += p.price * i.qty;
        count += i.qty;
        return `
          <div class="cart-item">
            <h4>${esc(p.name)}</h4>
            <span class="cart-item__price">${euro.format(p.price * i.qty)}</span>
            <div class="qty">
              <button data-dec="${esc(p.id)}" aria-label="${tr("cart.dec")}">−</button>
              <span>${i.qty}</span>
              <button data-inc="${esc(p.id)}" aria-label="${tr("cart.inc")}">+</button>
            </div>
            <button class="cart-item__remove" data-del="${esc(p.id)}">${tr("cart.remove")}</button>
          </div>`;
      }).join("");
    }
    $("#cartTotal").textContent = euro.format(total);
    $("#cartCount").textContent = count;
    $("#checkout").disabled = !rows.length;
  }

  $("#cartItems").addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.dataset.inc) changeQty(t.dataset.inc, 1);
    if (t.dataset.dec) changeQty(t.dataset.dec, -1);
    if (t.dataset.del) { cart = cart.filter((i) => String(i.id) !== t.dataset.del); saveCart(); }
  });

  /* Pagamento SellAuth: la finestra di pagamento si apre sopra il sito.
     A pagamento confermato SellAuth consegna subito il prodotto (a schermo e via email). */
  let paidJustNow = false;

  /* Checkout SellAuth a TUTTA PAGINA (con i passaggi: informazioni, conferma e pagamento, consegna).
     Usa il "Checkout Link" ufficiale: https://<negozio>.mysellauth.com/checkout-link?cart[0][productId]=...&cart[0][variantId]=...&cart[0][quantity]=...
     Il carrello resta salvato finché il cliente non lo svuota, così non si perde se annulla il pagamento. */
  function sellauthCheckoutUrl(items) {
    let base;
    try { const u = new URL(String(SA.shopUrl || "").replace(/\/+$/, "")); if (u.protocol !== "https:") return null; base = u.origin; } catch { return null; }
    const q = new URLSearchParams();
    for (let i = 0; i < items.length; i++) {
      const { p, qty } = items[i];
      const pid = Number(p.sellauthProductId), vid = Number(p.sellauthVariantId);
      if (!(pid > 0) || !(vid > 0)) return null;      // il checkout-link richiede sempre prodotto e variante
      q.set(`cart[${i}][productId]`, String(pid));
      q.set(`cart[${i}][variantId]`, String(vid));
      q.set(`cart[${i}][quantity]`, String(Math.min(99, Math.max(1, Math.floor(Number(qty) || 1)))));
    }
    if (SA.currency) q.set("currency", String(SA.currency));
    if (currentUser?.email) q.set("email", currentUser.email);
    return `${base}/checkout-link?${q.toString()}`;
  }

  /* se una card non ha l'ID variante, lo chiediamo al proxy (variante più economica) */
  const variantCache = {};
  async function fillVariants(items) {
    const proxy = String(SA.apiProxy || "").replace(/\/+$/, "");
    if (!proxy) return;
    await Promise.all(items.map(async ({ p }) => {
      if (Number(p.sellauthVariantId) > 0) return;
      const pid = Number(p.sellauthProductId);
      try {
        if (variantCache[pid] === undefined) {
          const r = await fetch(`${proxy}/products/${pid}`);
          const d = r.ok ? await r.json() : {};
          const vs = (d.variants || []).map((v) => ({ id: v.id, price: parseFloat(v.price) })).filter((v) => v.id && Number.isFinite(v.price)).sort((x, y) => x.price - y.price);
          variantCache[pid] = vs[0]?.id || 0;
        }
        if (variantCache[pid]) p.sellauthVariantId = String(variantCache[pid]);
      } catch { /* si prova senza */ }
    }));
  }

  async function payWithSellAuth(items, fromCart) {
    if (!sellauthOn) { toast(tr("pay.unavailable"), 5000); return; }
    await fillVariants(items);
    const link = sellauthCheckoutUrl(items);
    if (link) { closeCart(); closeProduct(); window.location.assign(link); return; }
    // ripiego: manca l'ID variante → finestra incorporata di SellAuth (importa il prodotto per avere il checkout a tutta pagina)
    if (!window.sellAuth?.open) { toast(tr("pay.unavailable"), 5000); return; }
    const saCart = items.map(({ p, qty }) => {
      const c = { productId: Number(p.sellauthProductId), quantity: qty };
      if (Number(p.sellauthVariantId) > 0) c.variantId = Number(p.sellauthVariantId);
      return c;
    });
    const paidIds = items.map(({ p }) => String(p.id));
    closeCart();
    closeProduct();
    paidJustNow = false;
    try {
      window.sellAuth.open({
        shopId: Number(SA.shopId),
        shopUrl: SA.shopUrl.replace(/\/+$/, ""),
        cart: saCart,
        theme: "dark",
        scrollTop: false,
        locale: I18N.lang,
        ...(SA.currency ? { currency: SA.currency } : {}),
        ...(currentUser?.email ? { email: currentUser.email } : {}),
        // compaiono sulla fattura SellAuth: così sai quale account del sito ha comprato
        metadata: { site_uid: String(currentUser?.uid || ""), site_user: String(currentUser?.name || "") },
        onSuccess: () => {
          paidJustNow = true;
          if (fromCart) { cart = cart.filter((i) => !paidIds.includes(String(i.id))); saveCart(); }
        }
      });
    } catch (err) {
      console.warn("[Empire] SellAuth non disponibile:", err);
      toast(tr("pay.unavailable"), 5000);
    }
  }
  document.addEventListener("sellauth:close", () => {
    if (paidJustNow) { paidJustNow = false; toast(tr("pay.success"), 8000); }
  });
  document.addEventListener("sellauth:error", (e) => {
    console.warn("[Empire] SellAuth:", e.detail);
    toast(tr("pay.error"), 5000);
  });

  $("#checkout").addEventListener("click", () => {
    const rows = cartRows();
    if (!rows.length) return;
    payWithSellAuth(rows.map(({ i, p }) => ({ p, qty: i.qty })), true);
  });

  /* ---------- 8. Reveal, contatori, tilt supporto ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      revealObserver.unobserve(e.target);
    });
  }, { threshold: 0.15 });

  function startReveals() {
    $$(".reveal").forEach((el, i) => {
      if (el.closest(".features__grid, .steps__list")) el.style.transitionDelay = `${(i % 3) * 110}ms`;
      revealObserver.observe(el);
    });

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = Number(el.dataset.target);
        const pre = el.dataset.prefix || "";
        const suf = el.dataset.suffix || "";
        const t0 = performance.now();
        const dur = 1600;
        const step = (now) => {
          const k = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - k, 4);
          el.textContent = pre + Math.round(target * eased) + suf;
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.6 });
    $$(".counter").forEach((c) => counterObserver.observe(c));
  }

  if (!isTouch && !reduceMotion) addTilt($("#supportCard"), 6);

  /* ---------- 9. Accesso e registrazione ---------- */
  let currentUser = null;
  let revealed = false;
  const authTabs = $(".auth__tabs");

  function switchTab(tab) {
    authTabs.dataset.active = tab;
    $$(".auth__tab").forEach((b) => {
      const on = b.dataset.tab === tab;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on);
    });
    $$(".auth__form").forEach((f) => f.classList.toggle("is-active", f.dataset.form === tab));
    $$(".auth__error").forEach((p) => (p.textContent = ""));
    const first = $(`[data-form="${tab}"] input`);
    if (first && !isTouch) first.focus();
  }
  $$(".auth__tab").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.tab)));
  $$("[data-go]").forEach((b) => b.addEventListener("click", () => switchTab(b.dataset.go)));

  $$(".field__eye").forEach((b) => b.addEventListener("click", () => {
    const input = b.previousElementSibling;
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    b.dataset.i18n = show ? "auth.hide" : "auth.show";
    b.dataset.i18nAttr = "aria-label:" + (show ? "auth.hidePass" : "auth.showPass");
    I18N.apply(b.parentElement);
  }));

  async function submitAuth(form, action) {
    const err = $(".auth__error", form);
    const btn = $("button[type=submit]", form);
    err.textContent = "";
    $$("input", form).forEach((i) => i.removeAttribute("aria-invalid"));
    const data = Object.fromEntries(new FormData(form));
    const invalid = (name, msg) => { form.elements[name].setAttribute("aria-invalid", "true"); form.elements[name].focus(); err.textContent = msg; };

    if (action === "register") {
      if (!data.name.trim()) return invalid("name", tr("auth.err.name"));
      if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) return invalid("email", tr("auth.err.email"));
      if (data.password.length < 8) return invalid("password", tr("auth.err.pass"));
      if (data.password !== data.confirm) return invalid("confirm", tr("auth.err.match"));
    } else {
      if (!data.email.trim()) return invalid("email", tr("auth.err.loginEmail"));
      if (!data.password) return invalid("password", tr("auth.err.loginPass"));
    }

    btn.classList.add("is-loading");
    btn.textContent = action === "register" ? tr("auth.creating") : tr("auth.loggingIn");
    try {
      if (action === "register") await Backend.register(data.name, data.email, data.password);
      else await Backend.login(data.email, data.password);
      form.reset();
    } catch (e) {
      err.textContent = e.message;
    } finally {
      btn.classList.remove("is-loading");
      btn.textContent = tr(btn.dataset.i18n);
    }
  }
  $("#forgotBtn").addEventListener("click", async () => {
    const form = $("#loginForm");
    const err = $(".auth__error", form);
    err.textContent = "";
    const email = form.elements.email.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) { form.elements.email.focus(); err.textContent = tr("auth.err.email"); return; }
    try {
      await Backend.resetPassword(email);
      toast(tr("toast.resetSent"));
    } catch (e) {
      err.textContent = e.message || tr("err.generic");
    }
  });
  $("#loginForm").addEventListener("submit", (e) => { e.preventDefault(); submitAuth(e.target, "login"); });
  $("#registerForm").addEventListener("submit", (e) => { e.preventDefault(); submitAuth(e.target, "register"); });

  // Menu utente
  const userMenu = $("#userMenu");
  const userBtn = $("#userBtn");
  const userDrop = $("#userDrop");
  const toggleDrop = (open) => {
    userDrop.classList.toggle("is-open", open);
    userBtn.setAttribute("aria-expanded", String(open));
  };
  userBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleDrop(!userDrop.classList.contains("is-open")); });
  document.addEventListener("click", (e) => { if (!userMenu.contains(e.target)) toggleDrop(false); });
  $("#logoutBtn").addEventListener("click", async () => {
    toggleDrop(false);
    closePanel();
    await Backend.logout();
    toast(tr("toast.logout"));
  });

  function applyUser(user, message) {
    const currentUserWas = currentUser;
    currentUser = user;
    const locked = !user;
    document.body.classList.toggle("is-locked", locked);
    updateVerifyNotice();

    if (locked) {
      if (sorting) setSorting(false);
      sortBar.hidden = true;
      userMenu.hidden = true;
      closeCart();
      closePanel();
      if (currentUserWas || message) switchTab("login");
      if (message) $("#loginForm .auth__error").textContent = message;
      return;
    }

    const founder = user.role === "founder";
    userMenu.hidden = false;
    userMenu.classList.toggle("user--founder", founder);
    $("#userAvatar").textContent = (user.name || "?").trim().charAt(0).toUpperCase();
    $("#userName").textContent = user.name;
    $("#dropName").textContent = user.name;
    $("#dropEmail").textContent = user.email;
    const role = $("#dropRole");
    role.textContent = founder ? "Founder" : tr("role.customer");
    role.className = "role" + (founder ? " role--founder" : "");
    $("#openPanel").hidden = !founder;
    sortBar.hidden = !founder;
    if (!founder && sorting) setSorting(false);

    // riparte l'animazione d'ingresso dell'hero dopo l'accesso
    window.scrollTo(0, 0);
    document.body.classList.remove("is-loaded");
    void document.body.offsetWidth;
    requestAnimationFrame(() => document.body.classList.add("is-loaded"));
    if (!revealed) { revealed = true; startReveals(); }

    loadProducts();
    toast(founder ? tr("toast.welcomeFounder", { name: user.name }) : tr("toast.welcome", { name: user.name }));
  }

  /* ---------- 10. Pannello Founder ---------- */
  const panel = $("#panel");
  const editor = $("#editor");
  const form = $("#productForm");
  let users = [], access = [], editingId = null, uploadedImage = "";

  function openPanel() {
    if (currentUser?.role !== "founder") return;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    refreshPanel();
  }
  function closePanel() {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    closeEditor();
  }
  $("#openPanel").addEventListener("click", () => { toggleDrop(false); openPanel(); });
  $("#panelClose").addEventListener("click", closePanel);
  panel.addEventListener("click", (e) => { if (e.target === panel) closePanel(); });

  $$(".ptab").forEach((t) => t.addEventListener("click", () => {
    $$(".ptab").forEach((x) => x.classList.toggle("is-active", x === t));
    $$(".panel__view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === t.dataset.view));
  }));

  async function refreshPanel() {
    try {
      [users, access] = await Promise.all([Backend.listUsers(), Backend.listAccess()]);
    } catch (e) { toast(e.message); }
    renderStats();
    renderProdTable();
    renderAccessTable();
    renderUserTable();
  }
  $("#refreshAccess").addEventListener("click", refreshPanel);
  $("#refreshUsers").addEventListener("click", refreshPanel);

  function renderStats() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const stats = [
      [users.length, tr("stat.users")],
      [access.filter((a) => a.at >= today.getTime()).length, tr("stat.today")],
      [products.length, tr("stat.cards")],
      [products.filter((p) => !isInf(p) && Number(p.stock) <= 0).length, tr("stat.out")],
      [users.filter((u) => u.status !== "active").length, tr("stat.banned")]
    ];
    $("#panelStats").innerHTML = stats.map(([n, l]) => `<div class="stat"><strong>${n}</strong><span>${l}</span></div>`).join("");
  }

  const match = (q, ...fields) => !q || fields.some((f) => String(f || "").toLowerCase().includes(q));
  const table = (head, rows, emptyMsg) =>
    `<table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${
      rows.length ? rows.join("") : `<tr><td class="empty-row" colspan="${head.length}">${emptyMsg}</td></tr>`
    }</tbody></table>`;

  function renderProdTable() {
    const q = $("#prodSearch").value.trim().toLowerCase();
    const rows = products.filter((p) => match(q, p.name, p.category, p.sellauthProductId)).map((p) => `
      <tr data-id="${esc(p.id)}">
        <td class="td-handle"><button type="button" class="drag-handle" aria-label="${esc(tr("sort.handle"))}" title="${esc(q ? tr("sort.clearSearch") : tr("sort.handle"))}"${q ? " disabled" : ""}>⠿</button></td>
        <td><div class="cell-flex">${p.image ? `<img class="thumb" src="${esc(p.image)}" alt="" />` : `<span class="thumb">♛</span>`}
          <div><strong>${esc(p.name)}</strong><small>${esc(p.category)}</small></div></div></td>
        <td>${euro.format(Number(p.price) || 0)}${p.oldPrice ? `<small><s>${euro.format(p.oldPrice)}</s></small>` : ""}</td>
        <td>${isInf(p) ? "∞" : Number(p.stock) > 0 ? p.stock : `<span class="status status--banned">${tr("card.out")}</span>`}</td>
        <td>${p.badge ? esc(I18N.badge(p.badge)) : "—"}</td>
        <td>${Number(p.sellauthProductId) > 0
          ? `<span class="status${sellauthOn ? "" : " status--idle"}">#${esc(p.sellauthProductId)}${Number(p.sellauthVariantId) > 0 ? ` · ${esc(p.sellauthVariantId)}` : ""}</span>`
          : "—"}</td>
        <td><div class="row-actions">
          <button class="mini" data-edit="${esc(p.id)}">${tr("btn.edit")}</button>
          <button class="mini mini--danger" data-remove="${esc(p.id)}">${tr("btn.delete")}</button>
        </div></td>
      </tr>`);
    $("#prodTable").innerHTML = table(["", tr("th.product"), tr("th.price"), tr("th.stock"), tr("th.badge"), tr("th.sellauth"), ""], rows, tr("empty.cards"));
  }
  $("#prodSearch").addEventListener("input", renderProdTable);
  makeSortable($("#prodTable"), {
    item: "tr[data-id]", handle: ".drag-handle",
    canStart: () => !$("#prodSearch").value.trim(),
    ghost: (row) => { const g = document.createElement("div"); g.className = "drag-ghost--row"; g.innerHTML = row.children[1]?.innerHTML || ""; return g; },
    onDrop: (ids) => saveOrder(ids, "table")
  });

  $("#prodTable").addEventListener("click", async (e) => {
    const edit = e.target.closest("[data-edit]");
    const del = e.target.closest("[data-remove]");
    if (edit) openEditor(findProduct(edit.dataset.edit));
    if (del) {
      const p = findProduct(del.dataset.remove);
      if (!p || !confirm(tr("confirm.delete", { name: p.name }))) return;
      try {
        await Backend.deleteProduct(p.id);
        await loadProducts();
        renderStats(); renderProdTable();
        toast(tr("toast.cardDeleted"));
      } catch (err) { toast(err.message); }
    }
  });

  function lastAccess(uid) {
    const a = access.find((x) => x.uid === uid);
    return a ? fmtDate(a.at) : "—";
  }

  function renderAccessTable() {
    const q = $("#accessSearch").value.trim().toLowerCase();
    const rows = access.filter((a) => match(q, a.name, a.email, a.ip)).map((a) => `
      <tr>
        <td><strong>${esc(a.name)}</strong></td>
        <td>${esc(a.email)}</td>
        <td>${fmtDate(a.at)}</td>
        <td>${esc(a.ip || "—")}</td>
        <td>${esc(a.device)}</td>
      </tr>`);
    $("#accessTable").innerHTML = table([tr("th.user"), tr("th.email"), tr("th.when"), tr("th.ip"), tr("th.device")], rows, tr("empty.access"));
  }
  $("#accessSearch").addEventListener("input", renderAccessTable);

  function renderUserTable() {
    const q = $("#userSearch").value.trim().toLowerCase();
    const rows = users.filter((u) => match(q, u.name, u.email)).map((u) => {
      const founder = u.role === "founder";
      const banned = u.status !== "active";
      return `
      <tr>
        <td><strong>${esc(u.name)}</strong></td>
        <td>${esc(u.email)}</td>
        <td><span class="role${founder ? " role--founder" : ""}">${founder ? "Founder" : tr("role.customer")}</span></td>
        <td><span class="status${banned ? " status--banned" : ""}">${banned ? tr("status.banned") : tr("status.active")}</span></td>
        <td>${fmtDate(u.createdAt)}</td>
        <td>${lastAccess(u.uid)}</td>
        <td><div class="row-actions">${founder ? "" : banned
          ? `<button class="mini" data-unban="${esc(u.uid)}">${tr("btn.unblock")}</button>`
          : `<button class="mini mini--danger" data-ban="${esc(u.uid)}">${tr("btn.block")}</button>`}</div></td>
      </tr>`;
    });
    $("#userTable").innerHTML = table([tr("th.user"), tr("th.email"), tr("th.role"), tr("th.status"), tr("th.registered"), tr("th.lastAccess"), ""], rows, tr("empty.users"));
  }
  $("#userSearch").addEventListener("input", renderUserTable);

  $("#userTable").addEventListener("click", async (e) => {
    const ban = e.target.closest("[data-ban]");
    const unban = e.target.closest("[data-unban]");
    const id = ban?.dataset.ban || unban?.dataset.unban;
    if (!id) return;
    const u = users.find((x) => x.uid === id);
    if (ban && !confirm(tr("confirm.block", { name: u?.name }))) return;
    try {
      await Backend.setUserStatus(id, ban ? "banned" : "active");
      await refreshPanel();
      toast(ban ? tr("toast.userBlocked") : tr("toast.userUnblocked"));
    } catch (err) { toast(err.message); }
  });

  // Editor card
  /* ID SellAuth: vuoto = null, solo cifre = numero, altro = NaN (segnalato al salvataggio) */
  const saId = (v) => { v = String(v || "").trim(); return v === "" ? null : /^\d{1,12}$/.test(v) ? Number(v) : NaN; };

  function readForm() {
    const d = Object.fromEntries(new FormData(form));
    return {
      id: editingId,
      name: d.name.trim(),
      category: d.category.trim(),
      price: d.price === "" ? 0 : Math.round(Number(d.price) * 100) / 100,
      oldPrice: d.oldPrice === "" ? null : Math.round(Number(d.oldPrice) * 100) / 100,
      infinite: d.infinite === "on",
      stock: d.infinite === "on" || !d.stock ? 0 : Math.max(0, Math.floor(Number(d.stock))),
      badge: I18N.badgeCanon(d.badge.trim()) || null,
      image: uploadedImage || d.image.trim(),
      description: d.description.trim(),
      sellauthProductId: saId(d.saProduct),
      sellauthVariantId: saId(d.saVariant)
    };
  }
  function updatePreview() {
    $("#editorPreview").innerHTML = cardTemplate({ ...readForm(), id: "preview" });
  }

  /* ===== Importa il prodotto da SellAuth (nome, descrizione, prezzo, immagine, stock) ===== */
  const SA_KEY_LS = "empire_sa_key";
  try { form.elements.saKey.value = localStorage.getItem(SA_KEY_LS) || ""; } catch { /* ok */ }
  form.elements.saKey.addEventListener("change", () => {
    try { localStorage.setItem(SA_KEY_LS, form.elements.saKey.value.trim()); } catch { /* ok */ }
    if (saId(form.elements.saProduct.value)) importFromSellAuth();   // chiave incollata dopo l'ID: importa subito
  });

  // con il proxy attivo la API key non serve: il campo sparisce
  if (typeof SELLAUTH !== "undefined" && SELLAUTH.apiProxy) form.elements.saKey.closest("label").hidden = true;

  const htmlToText = (s) => String(s || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|h[1-6])>/gi, "\n").replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n{3,}/g, "\n\n").trim();
  const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : null; };
  const saMsg = (text, bad) => { const el = $("#saImportMsg"); el.hidden = !text; el.textContent = text || ""; el.style.color = bad ? "#ff8aa0" : "#7dffb2"; };

  /* i dati del prodotto arrivano da SellAuth: i campi tecnici restano nascosti (e non bloccano il salvataggio) */
  function setManual() {
    const f = form.elements;
    $("#manualFields").hidden = true;
    ["name", "category", "price", "stock"].forEach((n) => { f[n].required = false; });
  }

  const variants0 = (p) => (Array.isArray(p.variants) ? p.variants : []);

  async function importFromSellAuth() {
    const id = saId(form.elements.saProduct.value);
    if (!id) { saMsg(tr("ed.saNoId"), true); return; }
    const key = form.elements.saKey.value.trim();
    const proxy = (typeof SELLAUTH !== "undefined" && SELLAUTH.apiProxy || "").replace(/\/$/, "");
    if (!proxy && !key) { saMsg(tr("ed.saNoKey"), true); return; }
    saMsg(tr("ed.saBusy"));
    try {
      const url = proxy ? `${proxy}/products/${id}` : `https://api.sellauth.com/v1/shops/${SELLAUTH.shopId}/products/${id}`;
      const res = await fetch(url, { headers: proxy ? { Accept: "application/json" } : { Authorization: `Bearer ${key}`, Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const p = data.data || data.product || data.item || data;
      if (!(p.name || p.title) && !variants0(p).length && p.price == null) throw new Error("shape:" + Object.keys(p).slice(0, 14).join(", "));
      const variants = Array.isArray(p.variants) ? p.variants : [];
      const priced = variants.map((v) => ({ v, price: num(v.price ?? v.amount) })).filter((x) => x.price !== null).sort((a, b) => a.price - b.price);
      const best = priced[0];
      const price = best ? best.price : num(p.price);
      const findSlash = (o) => { if (!o) return null; for (const k of Object.keys(o)) { if (/slash|old|compare|original|before/i.test(k) && num(o[k]) !== null) return num(o[k]); } return null; };
      const slash = findSlash(best?.v) ?? findSlash(p);

      const img0 = (Array.isArray(p.images) && p.images[0]) || p.image || p.thumbnail || null;
      const image = typeof img0 === "string" ? img0 : img0 ? (img0.url || img0.path || (img0.id ? `https://static.mysellauth.com/storage/images/${img0.id}.webp` : "")) : "";

      const f = form.elements;
      if (p.name || p.title) f.name.value = String(p.name || p.title).slice(0, 60);
      if (p.description != null) f.description.value = htmlToText(p.description).slice(0, 3000);
      if (price !== null) f.price.value = price.toFixed(2);
      f.oldPrice.value = slash !== null && price !== null && slash > price ? slash.toFixed(2) : "";
      if (image) { uploadedImage = ""; refreshUploadText(); f.image.value = image; }
      if (!f.category.value.trim()) f.category.value = p.group?.name || p.groups?.[0]?.name || "Prodotti";
      const vid = (best ? best.v : variants[0])?.id;
      if (vid) f.saVariant.value = String(vid);

      const isInfVal = (x) => x === null || x === undefined || Number(x) === -1 || /inf|∞/i.test(String(x));
      const vStocks = variants.map((v) => v.stock ?? v.stock_count);
      const hasStockInfo = variants.length ? variants.some((v) => "stock" in v || "stock_count" in v) : ("stock" in p || "stock_count" in p);
      if (hasStockInfo) {
        const list = variants.length ? vStocks : [p.stock ?? p.stock_count];
        const inf = list.some(isInfVal);
        f.infinite.checked = inf;
        if (!inf) f.stock.value = Math.max(0, Math.floor(list.reduce((s, x) => s + (Number(x) || 0), 0)));
        syncInfinite();
      }
      updatePreview();
      form.dataset.imported = "1";
      saMsg(`${tr("ed.saDone")} — ${f.name.value} · ${f.price.value} €`);
    } catch (err) {
      const c = String(err.message);
      if (c.startsWith("shape:")) { saMsg(`${tr("ed.saFail")}: ${tr("ed.saShape")} ${c.slice(6)}`, true); return; }
      saMsg(`${tr("ed.saFail")} (${c === "401" || c === "403" ? tr("ed.saBadKey") : c === "404" ? tr("ed.saNotFound") : tr("ed.saNet")})`, true);
    }
  }
  form.elements.saProduct.addEventListener("change", importFromSellAuth);
  $("#saImportBtn").addEventListener("click", importFromSellAuth);

  function refreshUploadText() {
    $("#uploadText").textContent = uploadedImage ? tr("ed.uploaded") : tr("ed.upload");
  }
  function refreshBadgeList() {
    $("#badgeList").innerHTML = ["Nuovo", "Top", "Hot", "Offerta"].map((b) => `<option value="${esc(I18N.badge(b))}">`).join("");
  }

  /* con "stock infinito" attivo il campo disponibilità si disattiva */
  function syncInfinite() {
    const on = form.elements.infinite.checked;
    form.elements.stock.disabled = on;
    form.elements.stock.required = !on;
  }
  form.elements.infinite.addEventListener("change", () => { syncInfinite(); updatePreview(); });

  function openEditor(p) {
    delete form.dataset.imported; saMsg("");
    editingId = p?.id ?? null;
    uploadedImage = p?.image?.startsWith("data:") ? p.image : "";
    form.reset();
    $("#editorError").textContent = "";
    $("#editorTitle").textContent = p ? tr("ed.edit") : tr("panel.newCard");
    refreshUploadText();
    $("#catList").innerHTML = [...new Set(products.map((x) => x.category))].map((c) => `<option value="${esc(c)}">`).join("");
    if (p) {
      form.elements.name.value = p.name || "";
      form.elements.category.value = p.category || "";
      form.elements.price.value = p.price ?? "";
      form.elements.oldPrice.value = p.oldPrice ?? "";
      form.elements.stock.value = p.stock ?? "";
      form.elements.infinite.checked = p.infinite === true;
      form.elements.badge.value = p.badge ? I18N.badge(p.badge) : "";
      form.elements.image.value = uploadedImage ? "" : (p.image || "");
      form.elements.description.value = p.description || "";
      form.elements.saProduct.value = p.sellauthProductId ?? "";
      form.elements.saVariant.value = p.sellauthVariantId ?? "";
    }
    syncInfinite();
    setManual();
    $("#saOff").hidden = sellauthOn;
    updatePreview();
    editor.classList.add("is-open");
    editor.setAttribute("aria-hidden", "false");
    setTimeout(() => form.elements.name.focus(), 50);
  }
  function closeEditor() {
    editor.classList.remove("is-open");
    editor.setAttribute("aria-hidden", "true");
  }
  $("#newProduct").addEventListener("click", () => openEditor(null));
  $("#editorClose").addEventListener("click", closeEditor);
  $("#editorCancel").addEventListener("click", closeEditor);
  editor.addEventListener("click", (e) => { if (e.target === editor) closeEditor(); });
  form.addEventListener("input", (e) => {
    if (e.target.name === "image" && e.target.value) { uploadedImage = ""; refreshUploadText(); }
    updatePreview();
  });

  // Upload immagine: viene ridimensionata a 700px per restare leggera
  const upload = $(".upload");
  ["dragenter", "dragover"].forEach((ev) => upload.addEventListener(ev, () => upload.classList.add("is-drag")));
  ["dragleave", "drop"].forEach((ev) => upload.addEventListener(ev, () => upload.classList.remove("is-drag")));
  $("#imageFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 700;
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        uploadedImage = c.toDataURL("image/webp", 0.82);
        form.elements.image.value = "";
        $("#uploadText").textContent = tr("ed.uploadedFile", { file: file.name });
        updatePreview();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  /* Il Founder deve avere l'email verificata, altrimenti le regole Firestore bloccano le modifiche.
     L'avviso compare in 3 posti: barra gialla in basso, menu del profilo e Pannello. */
  let verifyFloatDismissed = false;
  function updateVerifyNotice() {
    const need = currentUser?.role === "founder" && typeof Backend.emailVerified === "function" && Backend.emailVerified() === false;
    const set = (sel, show) => { const el = $(sel); if (el) el.hidden = !show; };
    set("#verifyNotice", need);
    set("#verifyDrop", need);
    set("#verifyFloat", need && !verifyFloatDismissed);
  }
  async function sendVerificationNow() {
    let msg;
    try { msg = `${tr("sec.verifySent")} ${await Backend.sendVerification()}`; } catch { msg = tr("sec.verifyFail"); }
    ["#verifyText", "#verifyFloatText", "#verifyDropText"].forEach((s) => { const el = $(s); if (el) el.textContent = msg; });
  }
  ["#verifyBtn", "#verifyFloatBtn", "#verifyDropBtn"].forEach((s) => $(s)?.addEventListener("click", sendVerificationNow));
  $("#verifyFloatX")?.addEventListener("click", () => { verifyFloatDismissed = true; updateVerifyNotice(); });
  // tornando sulla scheda dopo aver cliccato il link nella mail: aggiorna lo stato senza dover uscire
  window.addEventListener("focus", async () => {
    if (currentUser?.role === "founder" && typeof Backend.refreshAuth === "function" && Backend.emailVerified?.() === false) {
      try { await Backend.refreshAuth(); } catch { /* ok */ }
      updateVerifyNotice();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const p = readForm();
    const err = $("#editorError");
    if (!p.name || !p.category || !(p.price > 0)) { err.textContent = tr("ed.saNeedImport"); return form.elements.saProduct.focus(); }
    if (p.oldPrice !== null && p.oldPrice <= p.price) p.oldPrice = null;
    if (Number.isNaN(p.sellauthProductId)) { err.textContent = tr("ed.err.saId"); return form.elements.saProduct.focus(); }
    if (Number.isNaN(p.sellauthVariantId)) { err.textContent = tr("ed.err.saId"); return form.elements.saVariant.focus(); }
    if (p.sellauthVariantId && !p.sellauthProductId) { err.textContent = tr("ed.err.saVariant"); return form.elements.saProduct.focus(); }
    const btn = $("#editorSave");
    btn.classList.add("is-loading");
    const finishSave = async () => {
      await loadProducts();
      renderStats(); renderProdTable();
      closeEditor();
      toast(editingId ? tr("toast.cardUpdated") : tr("toast.cardPublished"));
    };
    try {
      await Backend.saveProduct(p);
      await finishSave();
    } catch (er) {
      let last = er;
      // permessi negati: se l'email è stata appena verificata, aggiorna l'accesso e riprova una volta
      if (er.message === tr("err.not-allowed") && typeof Backend.refreshAuth === "function") {
        try { await Backend.refreshAuth(); await Backend.saveProduct(p); await finishSave(); return; } catch (er2) { last = er2; }
      }
      const unverified = typeof Backend.emailVerified === "function" && Backend.emailVerified() === false;
      err.textContent = (last.message === tr("err.not-allowed") && unverified) ? `${tr("sec.verifyText")} ${tr("sec.verifyHint")}` : last.message;
      updateVerifyNotice();
    } finally {
      btn.classList.remove("is-loading");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (editor.classList.contains("is-open")) closeEditor();
    else if (pmodal.classList.contains("is-open")) closeProduct();
    else if (panel.classList.contains("is-open")) closePanel();
    else closeCart();
  });

  /* ---------- Cambio lingua dal vivo ---------- */
  I18N.onChange(() => {
    refreshFormats();
    // messaggi di errore già mostrati: li togliamo per non lasciarli nella lingua vecchia
    $$(".auth__error").forEach((p) => { p.textContent = ""; });
    $$("[aria-invalid]").forEach((i) => i.removeAttribute("aria-invalid"));
    if (currentUser) $("#dropRole").textContent = currentUser.role === "founder" ? "Founder" : tr("role.customer");
    updateVerifyNotice();
    renderFilters();
    renderProducts();
    renderCart();
    refreshBadgeList();
    if (pmId !== null) renderProductModal();
    if (panel.classList.contains("is-open")) { renderStats(); renderProdTable(); renderAccessTable(); renderUserTable(); }
    if (editor.classList.contains("is-open")) {
      $("#editorTitle").textContent = editingId !== null ? tr("ed.edit") : tr("panel.newCard");
      refreshUploadText();
      form.elements.badge.value = I18N.badge(I18N.badgeCanon(form.elements.badge.value.trim()));
      updatePreview();
    }
  });

  /* ---------- Avvio ---------- */
  refreshBadgeList();
  refreshUploadText();
  renderCart();
  if (Backend.mode === "demo") $("#demoNote").hidden = false;
  Backend.onAuth(applyUser);
  I18N.apply();   // traduce anche gli elementi creati da script (es. il marquee)
  Backend.init().catch(() => {
    $("#loginForm .auth__error").textContent = tr("auth.serverErr");
  });

  function nav_state() { nav.classList.toggle("is-scrolled", scroll.y > 40); }

  function loop() {
    scroll.velocity += ((scroll.y - scroll.last) - scroll.velocity) * 0.2;
    scroll.last = scroll.y;
    nav_state();
    moveMarquee();
    renderScene();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
