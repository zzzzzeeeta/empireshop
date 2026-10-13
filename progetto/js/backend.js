/* =========================================================
   BACKEND — EMPIRE SHOP
   Stessa interfaccia per due modalità:
   - DemoBackend:     tutto nel browser (localStorage)
   - FirebaseBackend: Firebase Authentication + Firestore
   ========================================================= */

const Backend = (() => {
  "use strict";

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  /* Messaggi d'errore: i testi sono in js/i18n.js (chiavi "err.<codice>") e seguono la lingua scelta */
  const KNOWN_ERR = ["demo-reset", "email-in-use", "invalid-login", "weak-password", "invalid-email", "banned", "not-allowed", "network", "generic"];
  const fail = (code) => {
    const e = new Error(I18N.t("err." + (KNOWN_ERR.includes(code) ? code : "generic")));
    e.code = code;
    throw e;
  };

  function device(ua = navigator.userAgent) {
    const b = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Chrome"
      : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
    const o = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS"
      : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Other";
    return `${b} · ${o}`;
  }

  /* Indirizzo IP pubblico del visitatore.
     Il browser non può conoscerlo da solo: lo chiede a servizi esterni gratuiti.
     I servizi vengono interrogati insieme e vale il primo che risponde, così se uno è bloccato
     (adblock, rete aziendale...) si usa un altro. Se nessuno risponde entro 5 secondi l'accesso
     viene registrato lo stesso, con IP "—". */
  const IP_SERVICES = [
    { url: "https://api.ipify.org?format=json",           pick: (t) => JSON.parse(t).ip },
    { url: "https://www.cloudflare.com/cdn-cgi/trace",    pick: (t) => (t.match(/^ip=(.+)$/m) || [])[1] },
    { url: "https://api64.ipify.org?format=json",         pick: (t) => JSON.parse(t).ip },
    { url: "https://ipapi.co/json/",                      pick: (t) => JSON.parse(t).ip }
  ];
  const IP_OK = /^[0-9a-fA-F:.]{3,45}$/;
  let ipCache = null;

  async function askIp(svc, signal) {
    const r = await fetch(svc.url, { signal, cache: "no-store" });
    if (!r.ok) throw new Error("http " + r.status);
    const ip = String(svc.pick(await r.text()) || "").trim();
    if (!IP_OK.test(ip)) throw new Error("risposta non valida");
    return ip;
  }

  async function fetchIp() {
    if (ipCache) return ipCache;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    try {
      const attempts = IP_SERVICES.map((svc) => askIp(svc, ctrl.signal));
      ipCache = typeof Promise.any === "function"
        ? await Promise.any(attempts)
        : await new Promise((res, rej) => { let n = 0; attempts.forEach((p) => p.then(res, () => { if (++n === attempts.length) rej(); })); });
      ctrl.abort(); // gli altri tentativi non servono più
    } catch {
      console.warn("[Empire] IP non rilevato: tutti i servizi sono bloccati o non raggiungibili da questa pagina.");
    }
    clearTimeout(timer);
    return ipCache || "—";
  }
  fetchIp();   // lo chiediamo subito all'apertura della pagina, così è già pronto quando l'utente accede

  /* -------------------------------------------------------
     MODALITÀ DEMO
     ------------------------------------------------------- */
  function DemoBackend() {
    const P = (typeof DEMO_STORAGE !== "undefined" && DEMO_STORAGE) || "empire";
    const K = { users: `${P}-users`, session: `${P}-session`, products: `${P}-products`, access: `${P}-access` };
    const read = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
    const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* pieno o disattivato */ } };

    async function hash(text) {
      try {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
        return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
      } catch {
        let h = 0; for (const c of text) h = (h * 31 + c.charCodeAt(0)) | 0; return "x" + h;
      }
    }

    const listeners = [];
    const publicUser = (u) => u && ({ uid: u.uid, name: u.name, email: u.email, role: u.role, status: u.status, createdAt: u.createdAt });
    const emit = () => { const u = current(); listeners.forEach((cb) => cb(publicUser(u))); };
    const current = () => {
      const id = read(K.session, null);
      const u = id && read(K.users, []).find((x) => x.uid === id);
      if (u && u.status !== "active") { write(K.session, null); return null; }
      return u || null;
    };
    const isFounder = () => current()?.role === "founder";

    async function logAccess(u) {
      const at = Date.now();
      const ip = await fetchIp();
      const log = read(K.access, []);
      log.unshift({ id: uid(), uid: u.uid, name: u.name, email: u.email, at, device: device(), ip });
      write(K.access, log.slice(0, 500));
    }

    if (!read(K.products, null)) write(K.products, PRODUCTS);

    return {
      mode: "demo",
      async init() {},
      onAuth(cb) { listeners.push(cb); cb(publicUser(current())); },

      async register(name, email, pass) {
        email = email.trim().toLowerCase();
        if (!/^\S+@\S+\.\S+$/.test(email)) fail("invalid-email");
        if (pass.length < 8) fail("weak-password");
        const users = read(K.users, []);
        if (users.some((u) => u.email === email)) fail("email-in-use");
        const salt = uid();
        const u = {
          uid: uid(), name: name.trim(), email, salt,
          pass: await hash(salt + pass),
          role: users.length === 0 ? "founder" : "user",
          status: "active", createdAt: Date.now()
        };
        users.push(u);
        write(K.users, users);
        write(K.session, u.uid);
        logAccess(u);
        emit();
      },

      async resetPassword() {
        // in demo gli account vivono solo nel browser: non esiste un'email a cui spedire il link
        fail("demo-reset");
      },

      async login(email, pass) {
        email = email.trim().toLowerCase();
        const u = read(K.users, []).find((x) => x.email === email);
        if (!u || u.pass !== await hash(u.salt + pass)) fail("invalid-login");
        if (u.status !== "active") fail("banned");
        write(K.session, u.uid);
        logAccess(u);
        emit();
      },

      async logout() { write(K.session, null); emit(); },

      async getProducts() { return read(K.products, []); },
      async saveProduct(p) {
        if (!isFounder()) fail("not-allowed");
        const list = read(K.products, []);
        if (!p.id) { p.id = uid(); list.push(p); }
        else { const i = list.findIndex((x) => String(x.id) === String(p.id)); i >= 0 ? (list[i] = p) : list.push(p); }
        write(K.products, list);
        return p;
      },
      async deleteProduct(id) {
        if (!isFounder()) fail("not-allowed");
        write(K.products, read(K.products, []).filter((x) => String(x.id) !== String(id)));
      },

      async listUsers() {
        if (!isFounder()) fail("not-allowed");
        return read(K.users, []).map(publicUser);
      },
      async setUserStatus(id, status) {
        if (!isFounder()) fail("not-allowed");
        const users = read(K.users, []);
        const u = users.find((x) => x.uid === id);
        if (!u || u.role === "founder") fail("not-allowed");
        u.status = status;
        write(K.users, users);
      },
      async listAccess() {
        if (!isFounder()) fail("not-allowed");
        return read(K.access, []);
      }
    };
  }

  /* -------------------------------------------------------
     MODALITÀ FIREBASE
     ------------------------------------------------------- */
  function FirebaseBackend() {
    const VERSION = "10.12.2";
    let auth, db, me = null;
    const listeners = [];

    const load = (src) => new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = () => rej(new Error(I18N.t("err.firebase")));
      document.head.appendChild(s);
    });

    function mapError(e) {
      const c = e?.code || "";
      if (c.includes("email-already-in-use")) fail("email-in-use");
      if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found")) fail("invalid-login");
      if (c.includes("weak-password")) fail("weak-password");
      if (c.includes("invalid-email")) fail("invalid-email");
      if (c.includes("permission-denied")) fail("not-allowed");
      if (c.includes("network")) fail("network");
      if (e?.code && KNOWN_ERR.includes(e.code)) throw e;
      fail("generic");
    }

    async function logAccess(u) {
      await db.collection("access").add({
        uid: u.uid, name: u.name, email: u.email,
        at: firebase.firestore.FieldValue.serverTimestamp(), device: device(), ip: await fetchIp()
      });
    }

    let pendingName = null;

    /* Spedisce da Firebase l'email con il link per scegliere una nuova password.
       Se l'indirizzo non esiste non lo diciamo (così nessuno può scoprire chi è iscritto). */
    async function resetPassword(email) {
      try { await auth.sendPasswordResetEmail(email.trim()); }
      catch (e) { if (e?.code === "auth/user-not-found") return; mapError(e); }
    }

    return {
      mode: "firebase",
      resetPassword,
      async init() {
        const base = `https://www.gstatic.com/firebasejs/${VERSION}/`;
        await load(base + "firebase-app-compat.js");
        await load(base + "firebase-auth-compat.js");
        await load(base + "firebase-firestore-compat.js");
        firebase.initializeApp(FIREBASE_CONFIG);
        auth = firebase.auth();
        db = firebase.firestore();

        auth.onAuthStateChanged(async (fu) => {
          me = null;
          if (fu) {
            const ref = db.collection("users").doc(fu.uid);
            let snap = await ref.get();
            if (!snap.exists) {
              const email = (fu.email || "").toLowerCase();
              await ref.set({
                name: String(pendingName || fu.displayName || email.split("@")[0]).slice(0, 60),
                email,
                role: email === FOUNDER_EMAIL.toLowerCase() ? "founder" : "user",
                status: "active",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
              });
              snap = await ref.get();
              pendingName = null;
            }
            const d = snap.data();
            if (d.status !== "active") {
              await auth.signOut();
              listeners.forEach((cb) => cb(null, I18N.t("err.banned")));
              return;
            }
            me = { uid: fu.uid, name: d.name, email: d.email, role: d.role, status: d.status };
            if (sessionStorage.getItem("es-logged") !== fu.uid) {
              sessionStorage.setItem("es-logged", fu.uid);
              logAccess(me).catch(() => {});
            }
          } else {
            sessionStorage.removeItem("es-logged");
          }
          listeners.forEach((cb) => cb(me));
        });
      },
      onAuth(cb) { listeners.push(cb); },

      async register(name, email, pass) {
        try {
          pendingName = name.trim();
          const cred = await auth.createUserWithEmailAndPassword(email.trim(), pass);
          await cred.user.updateProfile({ displayName: name.trim() });
          cred.user.sendEmailVerification().catch(() => {});   // email di verifica (best effort)
        } catch (e) { pendingName = null; mapError(e); }
      },
      async login(email, pass) {
        try { await auth.signInWithEmailAndPassword(email.trim(), pass); }
        catch (e) { mapError(e); }
      },
      async logout() { await auth.signOut(); },
      emailVerified() { return !!auth?.currentUser?.emailVerified; },
      async sendVerification() { await auth.currentUser.sendEmailVerification(); return auth.currentUser.email; },
      async refreshAuth() { if (!auth?.currentUser) return; await auth.currentUser.reload(); await auth.currentUser.getIdToken(true); },   // dopo la verifica email: aggiorna i permessi senza uscire

      async getProducts() {
        try {
          const snap = await db.collection("products").get();
          const list = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
          // primo avvio del founder: carica il catalogo di esempio
          if (!list.length && me?.role === "founder") {
            for (const p of PRODUCTS) { const { id, ...rest } = p; await db.collection("products").add(rest); }
            return this.getProducts();
          }
          return list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        } catch (e) { mapError(e); }
      },
      async saveProduct(p) {
        try {
          const { id, ...data } = p;
          if (id) { await db.collection("products").doc(String(id)).set(data, { merge: true }); return p; }
          const ref = await db.collection("products").add({ ...data, order: Date.now() });
          return { ...p, id: ref.id };
        } catch (e) { mapError(e); }
      },
      async deleteProduct(id) {
        try { await db.collection("products").doc(String(id)).delete(); } catch (e) { mapError(e); }
      },

      async listUsers() {
        try {
          const snap = await db.collection("users").get();
          return snap.docs.map((d) => {
            const x = d.data();
            return { uid: d.id, ...x, createdAt: x.createdAt?.toMillis?.() || null };
          });
        } catch (e) { mapError(e); }
      },
      async setUserStatus(id, status) {
        try { await db.collection("users").doc(id).update({ status }); } catch (e) { mapError(e); }
      },
      async listAccess() {
        try {
          const snap = await db.collection("access").orderBy("at", "desc").limit(300).get();
          return snap.docs.map((d) => { const x = d.data(); return { id: d.id, ...x, at: x.at?.toMillis?.() || Date.now() }; });
        } catch (e) { mapError(e); }
      }
    };
  }

  return (typeof FIREBASE_CONFIG !== "undefined" && FIREBASE_CONFIG) ? FirebaseBackend() : DemoBackend();
})();
