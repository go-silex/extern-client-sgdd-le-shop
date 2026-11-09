(() => {
  const CATS = window.CATEGORIES;
  const CFG = window.SGDD_CONFIG || { mode: 'demo' };
  const LIVE = CFG.mode === 'live';
  const app = document.getElementById('app');

  // ---------- Storage (guarded) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } }
  };
  const K = { catalog: 'sgdd_catalog_v2', settings: 'sgdd_settings_v2', orders: 'sgdd_orders_v2', cart: 'sgdd_cart_v2', admin: 'sgdd_admin', last: 'sgdd_last_order' };
  const clone = o => JSON.parse(JSON.stringify(o));

  const DEFAULT_SETTINGS = {
    freeShip: 80, shipCost: 5.9, collect: true,
    announce: '',
    hours: 'Horaires et arrivages publiés sur notre page Facebook.',
    email: 'contact@sgdd-leshop.fr'
  };

  // ---------- Data layer (the admin edits the same objects) ----------
  // In live mode the catalogue and settings come from the files only (the demo admin space is off).
  let catalog = LIVE ? clone(window.PRODUCTS) : (store.get(K.catalog, null) || clone(window.PRODUCTS));
  let settings = LIVE ? { ...DEFAULT_SETTINGS, ...(CFG.settings || {}) } : { ...DEFAULT_SETTINGS, ...(CFG.settings || {}), ...store.get(K.settings, {}) };
  let orders = store.get(K.orders, null) || seedOrders();
  let cart = store.get(K.cart, []).filter(l => catalog.some(p => p.id === l.id));

  const byId = id => catalog.find(p => p.id === id);
  const visible = () => catalog.filter(p => p.active !== false);
  const saveCatalog = () => store.set(K.catalog, catalog);
  const saveSettings = () => store.set(K.settings, settings);
  const saveOrders = () => store.set(K.orders, orders);

  // Deterministic demo orders (mulberry32), dated relative to now.
  function seedOrders() {
    let s = 20261107;
    const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const pick = a => a[Math.floor(rnd() * a.length)];
    const names = ['Julie M.', 'Thomas R.', 'Sophie L.', 'Karim B.', 'Camille D.', 'Nicolas P.', 'Laura G.', 'Antoine V.', 'Emma C.', 'Hugo F.', 'Léa T.', 'Maxime A.', 'Chloé S.', 'Paul N.', 'Inès K.', 'Lucas H.', 'Manon J.', 'Romain E.'];
    const pool = window.PRODUCTS.filter(p => !p.giftCard);
    const out = [];
    for (let i = 0; i < 18; i++) {
      const n = 1 + Math.floor(rnd() * 3);
      const lines = [];
      for (let j = 0; j < n; j++) {
        const p = pick(pool);
        lines.push({ id: p.id, name: p.name, color: pick(p.colors).name, size: pick(p.sizes), qty: rnd() < .8 ? 1 : 2, price: p.price });
      }
      const sub = lines.reduce((a, l) => a + l.price * l.qty, 0);
      const ship = rnd() < .45 ? 'collect' : 'home';
      const fee = ship === 'collect' || sub >= DEFAULT_SETTINGS.freeShip ? 0 : DEFAULT_SETTINGS.shipCost;
      const daysAgo = Math.floor(i * 1.15 + rnd());
      const date = Date.now() - daysAgo * 86400000 - Math.floor(rnd() * 8) * 3600000;
      const status = i < 3 ? 'À préparer' : i < 6 ? (ship === 'collect' ? 'Prête en boutique' : 'Expédiée') : ship === 'collect' ? 'Retirée' : 'Livrée';
      out.push({ no: 'SGDD-' + (1240 - i), date, name: names[i], email: names[i].split(' ')[0].toLowerCase() + '@exemple.fr', ship, lines, total: Math.round((sub + fee) * 100) / 100, status, demo: true });
    }
    return out;
  }

  // ---------- Helpers ----------
  const eur = n => Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const catName = id => (CATS.find(c => c.id === id) || {}).name || '';
  const unitPrice = (p, colorName) => {
    const c = p.colors.find(c => c.name === colorName);
    return c && c.price ? c.price : p.price;
  };
  const fromPrice = p => p.giftCard ? 'Dès ' + eur(Math.min(...p.colors.map(c => c.price))) : eur(p.price);
  const mainImg = p => (p.imgs && p.imgs[0]) || '';
  const soldOut = p => !p.giftCard && (p.stock ?? 1) <= 0;

  const giftVisual = () => `
    <div class="giftcard"><div class="gc-inner">
      <span class="logo"><span class="logo-sgdd">SGDD</span><span class="logo-shop">Le Shop</span></span>
      <span class="gc-label">Carte cadeau</span>
    </div></div>`;
  const media = p => p.giftCard ? giftVisual() : `<img src="${esc(mainImg(p))}" alt="${esc(p.name)}" loading="lazy">`;

  function card(p) {
    const out = soldOut(p);
    return `
      <a class="card ${out ? 'is-out' : ''}" href="#/p/${p.id}">
        <div class="card-media ${p.fit === 'contain' ? 'contain' : ''}">
          ${out ? '<span class="badge badge-out">Épuisé</span>' : p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}
          ${media(p)}
          ${out ? '' : `<button class="quick-add" data-quick="${p.id}" aria-label="Ajouter ${esc(p.name)} au panier">+</button>`}
        </div>
        <div class="card-body">
          <div class="card-type">${esc(p.type)}</div>
          <div class="card-name">${esc(p.name)}</div>
          <div class="card-row">
            <span class="price">${fromPrice(p)}</span>
            <span class="swatches">${p.giftCard ? '' : p.colors.map(c => `<i style="background:${esc(c.hex)}" title="${esc(c.name)}"></i>`).join('')}</span>
          </div>
        </div>
      </a>`;
  }

  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400);
  }

  function renderTopbar() {
    const parts = settings.announce ? [settings.announce] : [];
    parts.push(`Livraison offerte dès ${settings.freeShip} €`);
    if (settings.collect) parts.push('Click & collect gratuit place de Verdun');
    document.getElementById('topbar').innerHTML = parts.map(esc).join('<span class="dot">★</span>');
  }

  // ---------- Cart ----------
  const keyOf = l => `${l.id}|${l.color}|${l.size}`;
  const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
  const subtotal = () => cart.reduce((s, l) => s + unitPrice(byId(l.id), l.color) * l.qty, 0);
  const shipFeeFor = (mode, s) => mode === 'collect' || s >= settings.freeShip ? 0 : settings.shipCost;
  function saveCart() {
    store.set(K.cart, cart);
    const el = document.getElementById('cartCount');
    el.textContent = cartCount();
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }
  function inCart(id) { return cart.filter(l => l.id === id).reduce((n, l) => n + l.qty, 0); }
  function addToCart(id, color, size, qty = 1) {
    const p = byId(id);
    if (!p || soldOut(p)) { toast('Article épuisé'); return; }
    if (!p.giftCard && inCart(id) + qty > p.stock) { toast(`Plus que ${p.stock - inCart(id)} en stock`); return; }
    color = color || p.colors[0].name;
    size = size || p.sizes[0];
    const line = cart.find(l => keyOf(l) === `${id}|${color}|${size}`);
    if (line) line.qty += qty; else cart.push({ id, color, size, qty });
    saveCart(); renderDrawer(); openDrawer(); toast('Ajouté au panier');
  }
  function setQty(key, qty) {
    const l = cart.find(l => keyOf(l) === key);
    if (!l) return;
    const p = byId(l.id);
    if (qty > l.qty && !p.giftCard && inCart(l.id) >= p.stock) { toast('Stock maximum atteint'); return; }
    l.qty = qty;
    if (l.qty <= 0) cart = cart.filter(x => x !== l);
    saveCart(); renderDrawer();
    if (location.hash.startsWith('#/commande')) render();
  }

  function lineHtml(l, editable = true) {
    const p = byId(l.id);
    const meta = [l.color, l.size].filter(x => x && x !== 'Unique' && x !== 'E-carte').join(' · ');
    return `
      <div class="line">
        <div class="line-img">${p.giftCard ? giftVisual() : `<img src="${esc(mainImg(p))}" alt="">`}</div>
        <div>
          <a class="line-name" href="#/p/${p.id}">${esc(p.name)}</a>
          <div class="line-meta">${esc(meta)}${editable ? '' : ` · Qté ${l.qty}`}</div>
          ${editable ? `<div class="qty"><button data-dec="${esc(keyOf(l))}" aria-label="Retirer un">−</button><span>${l.qty}</span><button data-inc="${esc(keyOf(l))}" aria-label="Ajouter un">+</button></div>` : ''}
        </div>
        <div class="line-right">
          <strong>${eur(unitPrice(p, l.color) * l.qty)}</strong>
          ${editable ? `<button class="remove" data-remove="${esc(keyOf(l))}">Retirer</button>` : ''}
        </div>
      </div>`;
  }

  function shipProgress() {
    const s = subtotal();
    if (s >= settings.freeShip) return `<div class="ship-progress">Livraison offerte, c'est bon pour vous.<div class="ship-bar"><i style="width:100%"></i></div></div>`;
    return `<div class="ship-progress">Plus que <b>${eur(settings.freeShip - s)}</b> pour la livraison offerte.<div class="ship-bar"><i style="width:${Math.round(s / settings.freeShip * 100)}%"></i></div></div>`;
  }

  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('overlay');
  function renderDrawer() {
    drawer.innerHTML = `
      <div class="drawer-head"><h3>Votre panier</h3><button class="icon-btn" data-action="close" aria-label="Fermer">✕</button></div>
      <div class="drawer-body">
        ${cart.length ? cart.map(l => lineHtml(l)).join('') : `<div class="empty"><p class="script">Panier vide</p><p>Allez faire un tour du côté des hoodies.</p><a class="btn btn-secondary" href="#/shop" data-action="close">Voir le shop</a></div>`}
      </div>
      ${cart.length ? `
      <div class="drawer-foot">
        ${shipProgress()}
        <div class="totals"><div class="grand"><span>Sous-total</span><span>${eur(subtotal())}</span></div></div>
        <a class="btn btn-primary btn-block" href="#/commande" data-action="close">Commander</a>
        <button class="btn btn-secondary btn-block" data-action="close">Continuer mes achats</button>
      </div>` : ''}`;
  }
  function openDrawer() { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); overlay.hidden = false; }
  function closeAll() {
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
    document.getElementById('nav').classList.remove('open'); overlay.hidden = true;
    document.querySelector('.adm-modal')?.remove();
  }

  // ---------- Views ----------
  function viewHome() {
    const feat = ['hoodie-phare-chopper', 'tee-phare-chopper', 'sherpa-jaym', 'casquette-trucker-sgdd', 'sweat-sgdd-college', 'veste-capuche-sgdd', 'hoodie-enfant', 'polo-sgdd']
      .map(byId).filter(p => p && p.active !== false);
    const catImg = { sgdd: 'assets/photos/fb/hoodie-rose.jpg', kids: 'assets/photos/fb/hoodie-enfant.jpg', jaym: 'assets/photos/fb/sherpa-jaym.jpg', 'surf-skate': 'assets/photos/crop-surfskate.jpg', vintage: 'assets/photos/fb/sticker-moto.jpg' };
    const words = ['SGDD', 'Surf', 'Skate', 'Chopper', 'Saint-Georges-de-Didonne', 'Place de Verdun'];
    const marquee = [...words, ...words, ...words, ...words].map(w => `<span>${w}</span><span class="star">★</span>`).join('');
    const F = 'assets/photos/fb/';
    return `
      <section class="hero">
        <div class="hero-inner">
          <div>
            <span class="hero-kicker">Concept store</span>
            <h1>Surf, skate <br>& <span class="hl">chopper</span></h1>
            <p class="lead">La boutique de Saint-Georges-de-Didonne, maintenant en ligne. Nos dessins SGDD sur hoodies, tees et casquettes, Jay'M Riding et une sélection vintage US.</p>
            <div class="hero-ctas">
              <a class="btn btn-primary" href="#/shop/sgdd">Voir la collection SGDD</a>
              <a class="btn btn-secondary" href="#/boutique">Passer à la boutique</a>
            </div>
            <div class="hero-meta">
              ${settings.collect ? '<div><strong>Click & collect</strong>Gratuit, place de Verdun</div>' : ''}
              <div><strong>Livraison offerte</strong>Dès ${settings.freeShip} €</div>
              <div><strong>100 % recommandé</strong>Avis Facebook</div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="sticker"><div>NEW<br>DROP<small>HIVER 2026</small></div></div>
            <figure class="polaroid p1"><img src="${F}cover.jpg" alt="Illustration SGDD : chopper sur la plage de Saint-Georges-de-Didonne"><figcaption>Saint-Georges-de-Didonne</figcaption></figure>
            <figure class="polaroid p2"><img src="assets/photos/vitrine.jpg" alt="La vitrine de SGDD Le Shop"><figcaption>Place de Verdun</figcaption></figure>
          </div>
        </div>
      </section>
      <div class="marquee" aria-hidden="true"><div class="marquee-track">${marquee}</div></div>

      <section class="section"><div class="wrap">
        <div class="section-head"><div><span class="script">Les rayons</span><h2>Choisis ton univers</h2></div><a class="link-arrow" href="#/shop">Tout le shop →</a></div>
        <div class="cats cats-5">
          ${CATS.map(c => `<a class="cat-tile" href="#/shop/${c.id}"><img src="${catImg[c.id]}" alt="" loading="lazy"><div class="label"><strong>${esc(c.name)}</strong><span>${esc(c.blurb)}</span></div></a>`).join('')}
        </div>
      </div></section>

      <section class="section" style="padding-top:0"><div class="wrap">
        <div class="section-head"><div><span class="script">Sur les cintres</span><h2>Les incontournables</h2></div><a class="link-arrow" href="#/shop">Voir les ${visible().length} articles →</a></div>
        <div class="grid">${feat.map(card).join('')}</div>
      </div></section>

      <section class="section designs"><div class="wrap">
        <div class="section-head"><div><span class="script">Dessiné à SGDD</span><h2>Les dessins de la maison</h2></div></div>
        <div class="designs-row">
          ${['dessin-surf', 'dessin-velo', 'dessin-chien-surf', 'logo-moto'].map(n => `<img src="${F}${n}.jpg" alt="Dessin SGDD" loading="lazy">`).join('')}
        </div>
      </div></section>

      <section class="section story"><div class="wrap story-inner">
        <div>
          <span class="script">L'histoire</span>
          <h2>SGDD au cœur du projet</h2>
          <p>SGDD, c'est Saint-Georges-de-Didonne. Marco a ouvert un concept store qui ressemble à la ville : la plage, les planches, les motos qui remontent le front de mer et un peu d'Amérique accrochée aux murs.</p>
          <p>Les visuels SGDD sont dessinés pour la boutique et imprimés en petites séries. Le reste, Marco le choisit pièce par pièce.</p>
          <div class="signature">Marco</div>
        </div>
        <div class="story-photos">
          <img src="${F}atelier.jpg" alt="Dans la boutique, planche de surf et chopper" loading="lazy">
          <img src="${F}stand-plage.jpg" alt="Le stand SGDD Le Shop sur la plage" loading="lazy">
        </div>
      </div></section>

      <section class="section"><div class="wrap">
        <div class="section-head"><div><span class="script">La tribu SGDD</span><h2>Vu sur notre page</h2></div><a class="link-arrow" target="_blank" rel="noopener" href="https://www.facebook.com/p/SGDD-Le-Shop-61576810880867/">Suivre sur Facebook →</a></div>
        <div class="tribe">
          ${['mascotte', 'lettres-plage', 'motards', 'stand', 'mur-photos', 'train'].map(n => `<img src="${F}${n}.jpg" alt="" loading="lazy">`).join('')}
        </div>
      </div></section>

      <section class="section" style="padding-top:0"><div class="wrap">
        <div class="perks">
          <div class="perk"><div class="ico">★</div><strong>Dessiné à SGDD</strong><span>Des visuels maison, imprimés en petites séries.</span></div>
          <div class="perk"><div class="ico">⌂</div><strong>Click & collect</strong><span>Commandez en ligne, récupérez place de Verdun.</span></div>
          <div class="perk"><div class="ico">✈</div><strong>Livraison en France</strong><span>Colissimo, offerte dès ${settings.freeShip} €.</span></div>
          <div class="perk"><div class="ico">↺</div><strong>30 jours pour changer</strong><span>Échange de taille en boutique ou par la poste.</span></div>
        </div>
      </div></section>

      <section class="section" style="padding-top:0"><div class="wrap">
        <div class="visit">
          <img src="assets/photos/arcades.jpg" alt="Les arcades devant SGDD Le Shop" loading="lazy">
          <div class="visit-body">
            <span class="script">Venir nous voir</span>
            <h3>Sous les arcades, place de Verdun</h3>
            <address>7 place de Verdun<br>17110 Saint-Georges-de-Didonne</address>
            <p>${esc(settings.hours)}</p>
            <div class="hero-ctas">
              <a class="btn btn-primary" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=7+place+de+Verdun+17110+Saint-Georges-de-Didonne">Itinéraire</a>
              <a class="btn btn-secondary" target="_blank" rel="noopener" href="https://www.facebook.com/p/SGDD-Le-Shop-61576810880867/">Facebook</a>
            </div>
          </div>
        </div>
      </div></section>
      ${newsletter()}`;
  }

  function newsletter() {
    return `
      <section class="news"><div class="wrap news-inner">
        <div><h3>Les nouveaux drops en premier</h3><p>Un email quand une nouvelle série SGDD arrive. Pas plus.</p></div>
        <form data-form="news"><input type="email" required placeholder="Votre email" aria-label="Votre email"><button class="btn btn-primary" type="submit">Je m'inscris</button></form>
      </div></section>`;
  }

  let shopState = { sort: 'featured', type: 'all' };
  function viewShop(cat, query) {
    let list = visible().filter(p => !cat || p.cat === cat);
    if (query) {
      const q = query.toLowerCase();
      list = visible().filter(p => (p.name + ' ' + p.type + ' ' + p.desc + ' ' + catName(p.cat)).toLowerCase().includes(q));
    }
    const types = [...new Set(list.map(p => p.type))];
    if (shopState.type !== 'all' && !types.includes(shopState.type)) shopState.type = 'all';
    let shown = list.filter(p => shopState.type === 'all' || p.type === shopState.type);
    if (shopState.sort === 'asc') shown = [...shown].sort((a, b) => a.price - b.price);
    if (shopState.sort === 'desc') shown = [...shown].sort((a, b) => b.price - a.price);
    shown = [...shown].sort((a, b) => soldOut(a) - soldOut(b));
    const c = CATS.find(x => x.id === cat);
    const title = query ? `Recherche : « ${esc(query)} »` : c ? esc(c.name) : 'Tout le shop';
    const sub = query ? '' : c ? esc(c.blurb) : 'Toute la boutique de la place de Verdun, en ligne.';
    return `
      <div class="wrap">
        <div class="page-head">
          <div class="crumbs"><a href="#/">Accueil</a> / ${c ? `<a href="#/shop">Shop</a> / ${esc(c.short)}` : 'Shop'}</div>
          <h1 class="page-title">${title}</h1>${sub ? `<p>${sub}</p>` : ''}
        </div>
        <div class="filters">
          <a class="chip ${!cat && !query ? 'active' : ''}" href="#/shop">Tout</a>
          ${CATS.map(x => `<a class="chip ${cat === x.id ? 'active' : ''}" href="#/shop/${x.id}">${esc(x.short)}</a>`).join('')}
          <span class="spacer"></span>
          <select data-filter="type" aria-label="Type d'article">
            <option value="all">Tous les types</option>
            ${types.map(t => `<option ${shopState.type === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}
          </select>
          <select data-filter="sort" aria-label="Trier">
            <option value="featured" ${shopState.sort === 'featured' ? 'selected' : ''}>Sélection</option>
            <option value="asc" ${shopState.sort === 'asc' ? 'selected' : ''}>Prix croissant</option>
            <option value="desc" ${shopState.sort === 'desc' ? 'selected' : ''}>Prix décroissant</option>
          </select>
        </div>
        <p class="result-count">${shown.length} article${shown.length > 1 ? 's' : ''}</p>
        ${shown.length ? `<div class="grid">${shown.map(card).join('')}</div>` : `<div class="empty"><p>Rien trouvé. Essayez « hoodie » ou « casquette ».</p></div>`}
        <div style="height:80px"></div>
      </div>`;
  }

  let pdpState = {};
  function viewProduct(id) {
    const p = byId(id);
    if (!p || p.active === false) return viewNotFound();
    if (pdpState.id !== id) pdpState = { id, color: p.colors[0].name, size: p.sizes.length === 1 ? p.sizes[0] : null, qty: 1, photo: 0 };
    const photos = p.giftCard ? [] : [...(p.imgs || [])];
    if (pdpState.photo >= photos.length) pdpState.photo = 0;
    const main = p.giftCard ? giftVisual() : `<img src="${esc(photos[pdpState.photo] || '')}" alt="${esc(p.name)}">`;
    const needSize = p.sizes.length > 1;
    const out = soldOut(p);
    const related = visible().filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 4);
    const price = unitPrice(p, pdpState.color);
    const low = !p.giftCard && !out && p.stock <= 3;
    let btnLabel = 'Ajouter au panier · ' + eur(price * pdpState.qty);
    if (needSize && !pdpState.size) btnLabel = 'Choisissez une taille';
    if (out) btnLabel = 'Épuisé';
    return `
      <div class="wrap">
        <div class="crumbs" style="padding-top:26px"><a href="#/">Accueil</a> / <a href="#/shop/${p.cat}">${esc(catName(p.cat))}</a> / ${esc(p.name)}</div>
        <div class="pdp">
          <div>
            <div class="gallery-main ${p.fit === 'contain' ? 'contain' : ''}">
              ${out ? '<span class="badge badge-out">Épuisé</span>' : p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}
              ${main}
            </div>
            ${photos.length > 1 ? `<div class="gallery-thumbs">${photos.map((src, i) => `<button class="${i === pdpState.photo ? 'active' : ''}" data-photo="${i}" aria-label="Photo ${i + 1}"><img src="${esc(src)}" alt=""></button>`).join('')}</div>` : ''}
          </div>
          <div class="pdp-info">
            <div class="card-type">${esc(catName(p.cat))} · ${esc(p.type)}</div>
            <h1>${esc(p.name)}</h1>
            <div class="pdp-price">${eur(price)}</div>
            ${low ? `<p class="low-stock">Plus que ${p.stock} en stock</p>` : ''}
            <p class="pdp-desc">${esc(p.desc)}</p>
            <div class="opt-group">
              <div class="opt-label">${p.giftCard ? 'Montant' : 'Couleur'} <span>${esc(pdpState.color)}</span></div>
              <div class="color-opts">
                ${p.colors.map(c => p.giftCard
                  ? `<button class="color-opt text ${c.name === pdpState.color ? 'active' : ''}" style="background:${esc(c.hex)};${c.hex === '#f7c623' ? 'color:#1c2f6b' : ''}" data-color="${esc(c.name)}">${esc(c.name)}</button>`
                  : `<button class="color-opt ${c.name === pdpState.color ? 'active' : ''}" style="background:${esc(c.hex)}" data-color="${esc(c.name)}" aria-label="${esc(c.name)}" title="${esc(c.name)}"></button>`).join('')}
              </div>
            </div>
            ${needSize ? `
            <div class="opt-group">
              <div class="opt-label">Taille <a href="#/infos" style="font-weight:400;color:var(--muted)">Guide des tailles</a></div>
              <div class="size-opts">${p.sizes.map(s => `<button class="size-opt ${s === pdpState.size ? 'active' : ''}" data-size="${esc(s)}">${esc(s)}</button>`).join('')}</div>
            </div>` : ''}
            <div class="buy-row">
              <div class="qty"><button data-pqty="-1" aria-label="Moins">−</button><span>${pdpState.qty}</span><button data-pqty="1" aria-label="Plus">+</button></div>
              <button class="btn btn-primary" data-add="${p.id}" ${out || (needSize && !pdpState.size) ? 'disabled' : ''}>${btnLabel}</button>
            </div>
            <div class="pdp-perks">
              <div>📦 <span><b>Livraison offerte</b> dès ${settings.freeShip} €, sinon ${eur(settings.shipCost)}</span></div>
              ${settings.collect ? '<div>🏄 <span><b>Click & collect</b> gratuit au 7 place de Verdun</span></div>' : ''}
              <div>↺ <span><b>30 jours</b> pour échanger ou retourner</span></div>
            </div>
            <details class="acc" open><summary>Détails</summary><ul>${(p.details || []).map(d => `<li>${esc(d)}</li>`).join('')}</ul></details>
            <details class="acc"><summary>Livraison & retours</summary><p>Expédition sous 48 h ouvrées en Colissimo. Retrait gratuit en boutique. Échange ou remboursement sous 30 jours, article non porté.</p></details>
          </div>
        </div>
        ${related.length ? `<div class="section-head"><div><span class="script">Dans le même rayon</span><h2>Ça va bien avec</h2></div></div><div class="grid">${related.map(card).join('')}</div>` : ''}
        <div style="height:80px"></div>
      </div>`;
  }

  let checkoutState = { ship: 'collect' };
  function viewCheckout() {
    if (!cart.length) return `<div class="wrap thanks"><span class="script">Panier vide</span><p class="big">Rien à commander pour l'instant</p><a class="btn btn-primary" href="#/shop">Voir le shop</a></div>`;
    if (!settings.collect && checkoutState.ship === 'collect') checkoutState.ship = 'home';
    const s = subtotal();
    const shipFee = shipFeeFor(checkoutState.ship, s);
    const total = s + shipFee;
    return `
      <div class="wrap">
        <div class="page-head"><div class="crumbs"><a href="#/">Accueil</a> / Commande</div><h1 class="page-title">Commande</h1></div>
        <form class="checkout" data-form="checkout">
          <div>
            <div class="panel">
              <h3><span class="n">1</span>Vos coordonnées</h3>
              <div class="row2">
                <div class="field"><label for="fn">Prénom</label><input id="fn" required autocomplete="given-name"></div>
                <div class="field"><label for="ln">Nom</label><input id="ln" required autocomplete="family-name"></div>
              </div>
              <div class="row2">
                <div class="field"><label for="em">Email</label><input id="em" type="email" required autocomplete="email"></div>
                <div class="field"><label for="ph">Téléphone</label><input id="ph" type="tel" autocomplete="tel"></div>
              </div>
            </div>
            <div class="panel">
              <h3><span class="n">2</span>Livraison</h3>
              ${settings.collect ? `<label class="ship-opt ${checkoutState.ship === 'collect' ? 'active' : ''}"><input type="radio" name="ship" value="collect" ${checkoutState.ship === 'collect' ? 'checked' : ''}><div><strong>Click & collect</strong><span>7 place de Verdun, Saint-Georges-de-Didonne. Prêt sous 24 h.</span></div><b>Gratuit</b></label>` : ''}
              <label class="ship-opt ${checkoutState.ship === 'home' ? 'active' : ''}"><input type="radio" name="ship" value="home" ${checkoutState.ship === 'home' ? 'checked' : ''}><div><strong>Colissimo à domicile</strong><span>France métropolitaine, 2 à 3 jours ouvrés.</span></div><b>${s >= settings.freeShip ? 'Offerte' : eur(settings.shipCost)}</b></label>
              ${checkoutState.ship === 'home' ? `
              <div class="field" style="margin-top:14px"><label for="ad">Adresse</label><input id="ad" required autocomplete="street-address"></div>
              <div class="row2">
                <div class="field"><label for="zc">Code postal</label><input id="zc" required autocomplete="postal-code" inputmode="numeric"></div>
                <div class="field"><label for="ct">Ville</label><input id="ct" required autocomplete="address-level2"></div>
              </div>` : ''}
            </div>
            <div class="panel">
              <h3><span class="n">3</span>Règlement</h3>
              <div class="pay-box">
                <p class="demo-note">Pas de paiement en ligne. Marco reçoit votre commande et vous contacte sous 24 h pour le règlement : en boutique au retrait, ou par virement pour un envoi.</p>
                <div class="field"><label for="nt">Un mot pour Marco (optionnel)</label><textarea id="nt" rows="2"></textarea></div>
              </div>
            </div>
          </div>
          <aside class="summary">
            <div class="panel">
              <h3>Récapitulatif</h3>
              ${cart.map(l => lineHtml(l, false)).join('')}
              <div class="totals" style="margin-top:14px">
                <div><span>Sous-total</span><span>${eur(s)}</span></div>
                <div><span>Livraison</span><span>${checkoutState.ship === 'collect' ? 'Retrait gratuit' : shipFee ? eur(shipFee) : 'Offerte'}</span></div>
                <div class="grand"><span>Total TTC</span><span>${eur(total)}</span></div>
              </div>
              <button class="btn btn-primary btn-block" type="submit" style="margin-top:18px">Valider ma commande</button>
            </div>
          </aside>
        </form>
      </div>`;
  }

  function viewThanks() {
    const o = store.get(K.last, null);
    return `
      <div class="wrap thanks">
        <span class="script">Merci${o && o.name ? ' ' + esc(o.name) : ''} !</span>
        <p class="big">Commande confirmée</p>
        ${o ? `<span class="order-no">N° ${esc(o.no)} · ${eur(o.total)}</span>` : ''}
        <p>Aucun paiement n'a été pris. Marco a reçu votre commande par email et vous contacte sous 24 h pour le règlement${o && o.ship === 'collect' ? ' et le retrait place de Verdun' : ' et l\'envoi'}.</p>
        <div class="hero-ctas" style="justify-content:center;margin-top:24px"><a class="btn btn-secondary" href="#/shop">Retour au shop</a>${LIVE ? '' : '<a class="btn btn-primary" href="#/admin/commandes">Voir côté gérant</a>'}</div>
      </div>`;
  }

  function viewBoutique() {
    const F = 'assets/photos/fb/';
    return `
      <div class="wrap">
        <div class="page-head"><div class="crumbs"><a href="#/">Accueil</a> / La boutique</div><span class="script">Concept store</span><h1 class="page-title">La boutique de Marco</h1>
          <p>Sous les arcades de la place de Verdun, à deux pas de la plage. Planches au plafond, fanions aux murs, et toute la collection SGDD sur les tables.</p></div>
        <div class="mosaic">
          <img class="wide" src="assets/photos/boutique-plafond.jpg" alt="La boutique vue de l'entrée">
          <img src="${F}vitrine-ete.jpg" alt="La vitrine en été">
          <img src="assets/photos/coin-surf.jpg" alt="Le coin surf">
          <img src="${F}atelier.jpg" alt="Planche et chopper">
          <img src="assets/photos/portant-sweats.jpg" alt="Le portant des sweats">
          <img src="${F}mur-photos.jpg" alt="Le mur de photos et le néon SGDD Le Shop">
          <img src="assets/photos/vitrine.jpg" alt="La vitrine">
        </div>
        <div class="visit" style="margin-bottom:80px">
          <img src="assets/photos/entree-2.jpg" alt="La façade de SGDD Le Shop">
          <div class="visit-body">
            <span class="script">Adresse</span>
            <h3>SGDD Le Shop</h3>
            <address>7 place de Verdun<br>17110 Saint-Georges-de-Didonne</address>
            <p>${esc(settings.hours)}</p>
            <div class="hero-ctas">
              <a class="btn btn-primary" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=7+place+de+Verdun+17110+Saint-Georges-de-Didonne">Itinéraire</a>
              <a class="btn btn-secondary" target="_blank" rel="noopener" href="https://www.facebook.com/p/SGDD-Le-Shop-61576810880867/">Facebook</a>
            </div>
          </div>
        </div>
      </div>
      ${newsletter()}`;
  }

  function viewInfos() {
    return `
      <div class="wrap">
        <div class="page-head"><div class="crumbs"><a href="#/">Accueil</a> / Infos</div><h1 class="page-title">Livraison, retours & tailles</h1></div>
        <div class="prose">
          <h2>Livraison</h2>
          <p>Colissimo en France métropolitaine : ${eur(settings.shipCost)}, offerte dès ${settings.freeShip} €. Expédition sous 48 h ouvrées.${settings.collect ? ' Click & collect gratuit au 7 place de Verdun, prêt sous 24 h.' : ''}</p>
          <h2>Retours et échanges</h2>
          <p>30 jours pour échanger ou être remboursé, article non porté avec son étiquette. Échange de taille possible directement en boutique.</p>
          <h2>Guide des tailles (hoodies et sweats)</h2>
          <table class="size-table">
            <tr><th>Taille</th><th>Largeur (cm)</th><th>Longueur (cm)</th></tr>
            <tr><td>XS</td><td>50</td><td>66</td></tr><tr><td>S</td><td>53</td><td>69</td></tr>
            <tr><td>M</td><td>56</td><td>72</td></tr><tr><td>L</td><td>59</td><td>74</td></tr>
            <tr><td>XL</td><td>62</td><td>76</td></tr><tr><td>XXL</td><td>65</td><td>78</td></tr>
          </table>
          <p>Coupe unisexe. Entre deux tailles, prenez la plus grande pour un tombé oversize.</p>
        </div>
      </div>`;
  }

  function viewNotFound() {
    return `<div class="wrap thanks"><span class="script">Oups</span><p class="big">Page introuvable</p><a class="btn btn-primary" href="#/">Retour à l'accueil</a></div>`;
  }

  // ---------- Router ----------
  function render() {
    const hash = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    const [route, arg, arg2] = hash.split('/');
    const isAdmin = route === 'admin' && !LIVE;
    document.body.classList.toggle('admin-mode', isAdmin);
    let html;
    if (isAdmin) html = window.SGDD_ADMIN.render(arg, arg2);
    else if (!route) html = viewHome();
    else if (route === 'shop') html = viewShop(arg);
    else if (route === 'recherche') html = viewShop(null, arg || '');
    else if (route === 'p') html = viewProduct(arg);
    else if (route === 'commande') html = viewCheckout();
    else if (route === 'merci') html = viewThanks();
    else if (route === 'boutique') html = viewBoutique();
    else if (route === 'infos') html = viewInfos();
    else html = viewNotFound();
    app.innerHTML = html;
    if (!isAdmin) renderTopbar();
    document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#/' + hash));
    const titles = { shop: 'Shop', p: (byId(arg) || {}).name, commande: 'Commande', merci: 'Merci', recherche: 'Recherche', boutique: 'La boutique', infos: 'Infos', admin: LIVE ? 'Page introuvable' : 'Espace gérant' };
    document.title = (titles[route] ? titles[route] + ' | ' : '') + 'SGDD Le Shop';
  }
  window.addEventListener('hashchange', () => {
    render(); closeAll();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });

  // ---------- Events ----------
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-action],[data-quick],[data-add],[data-color],[data-size],[data-pqty],[data-photo],[data-inc],[data-dec],[data-remove]');
    if (!t) { if (e.target === overlay) closeAll(); return; }
    const d = t.dataset;
    if (d.quick) {
      e.preventDefault();
      const p = byId(d.quick);
      if (p.sizes.length > 1) { location.hash = '#/p/' + p.id; toast('Choisissez votre taille'); return; }
      addToCart(p.id); return;
    }
    if (d.action === 'cart') { renderDrawer(); openDrawer(); return; }
    if (d.action === 'close') { closeAll(); return; }
    if (d.action === 'menu') { document.getElementById('nav').classList.add('open'); overlay.hidden = false; return; }
    if (d.action === 'search') {
      const bar = document.getElementById('searchBar'); bar.hidden = !bar.hidden;
      if (!bar.hidden) document.getElementById('searchInput').focus();
      return;
    }
    if (d.color) { pdpState.color = d.color; render(); return; }
    if (d.size) { pdpState.size = d.size; render(); return; }
    if (d.pqty) { pdpState.qty = Math.max(1, pdpState.qty + Number(d.pqty)); render(); return; }
    if (d.photo) { pdpState.photo = Number(d.photo); render(); return; }
    if (d.add) { addToCart(d.add, pdpState.color, pdpState.size, pdpState.qty); return; }
    if (d.inc) { const l = cart.find(l => keyOf(l) === d.inc); setQty(d.inc, l.qty + 1); return; }
    if (d.dec) { const l = cart.find(l => keyOf(l) === d.dec); setQty(d.dec, l.qty - 1); return; }
    if (d.remove) { setQty(d.remove, 0); return; }
  });

  document.addEventListener('change', e => {
    if (e.target.dataset.filter) { shopState[e.target.dataset.filter] = e.target.value; render(); }
    if (e.target.name === 'ship') { checkoutState.ship = e.target.value; render(); }
  });

  document.addEventListener('submit', e => {
    const f = e.target.dataset.form;
    if (f !== 'news' && f !== 'checkout') return;
    e.preventDefault();
    if (f === 'news') {
      const email = e.target.querySelector('input[type=email]').value.trim();
      e.target.reset();
      if (LIVE && CFG.orderEndpoint) sendForm({ _subject: 'Inscription newsletter SGDD Le Shop', email, Demande: 'Inscription à la newsletter' }).then(ok => toast(ok ? 'Inscription enregistrée, merci !' : 'Inscription impossible, réessayez plus tard'));
      else toast('Inscription enregistrée (démo)');
    }
    if (f === 'checkout') {
      const s = subtotal();
      const total = Math.round((s + shipFeeFor(checkoutState.ship, s)) * 100) / 100;
      const first = document.getElementById('fn').value.trim();
      const last = document.getElementById('ln').value.trim();
      const order = {
        no: 'SGDD-' + (Math.max(1240, ...orders.map(o => Number(o.no.split('-')[1]) || 0)) + 1),
        date: Date.now(),
        name: `${first} ${last.charAt(0)}.`.trim(),
        email: document.getElementById('em').value.trim(),
        ship: checkoutState.ship,
        lines: cart.map(l => { const p = byId(l.id); return { id: l.id, name: p.name, color: l.color, size: l.size, qty: l.qty, price: unitPrice(p, l.color) }; }),
        total, status: 'À préparer'
      };
      if (LIVE) { sendOrder(order, first, last, e.target); return; }
      cart.forEach(l => { const p = byId(l.id); if (!p.giftCard) p.stock = Math.max(0, p.stock - l.qty); });
      orders.unshift(order);
      saveOrders(); saveCatalog();
      store.set(K.last, { no: order.no, total, ship: order.ship, name: first });
      cart = []; saveCart(); renderDrawer();
      location.hash = '#/merci';
    }
  });

  // ---------- Live mode: the order is emailed to the shop through a form service (Formspree or similar) ----------
  async function sendForm(fields) {
    if (!CFG.orderEndpoint) return false;
    try {
      const r = await fetch(CFG.orderEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(fields) });
      return r.ok;
    } catch { return false; }
  }
  async function sendOrder(order, first, last, form) {
    const btn = form.querySelector('button[type=submit]');
    const val = id => (document.getElementById(id)?.value || '').trim();
    const d = new Date();
    order.no = 'SGDD-' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '-' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0') + String(d.getSeconds()).padStart(2, '0');
    const lines = order.lines.map(l => `${l.qty} x ${l.name}${[l.color, l.size].filter(x => x && x !== 'Unique' && x !== 'E-carte').map(x => ' / ' + x).join('')} : ${eur(l.price * l.qty)}`).join('\n');
    const fields = {
      _subject: `Nouvelle commande ${order.no} : ${eur(order.total)} (${order.ship === 'collect' ? 'retrait en boutique' : 'Colissimo'})`,
      'Numéro de commande': order.no,
      Client: `${first} ${last}`,
      email: order.email,
      'Téléphone': val('ph'),
      'Mode de livraison': order.ship === 'collect' ? 'Retrait gratuit en boutique' : 'Colissimo à domicile',
      'Adresse de livraison': order.ship === 'home' ? `${val('ad')}, ${val('zc')} ${val('ct')}` : 'Retrait en boutique',
      Articles: lines,
      'Total TTC': eur(order.total),
      'Message du client': val('nt') || '(aucun)',
      'Règlement': 'À régler en boutique ou par virement : rappeler le client sous 24 h.'
    };
    btn.disabled = true; btn.textContent = 'Envoi en cours...';
    const ok = await sendForm(fields);
    if (!ok) {
      btn.disabled = false; btn.textContent = 'Valider ma commande';
      toast('La commande n\'a pas pu partir. Réessayez ou appelez la boutique.');
      return;
    }
    store.set(K.last, { no: order.no, total: order.total, ship: order.ship, name: first });
    cart = []; saveCart(); renderDrawer();
    location.hash = '#/merci';
  }

  let searchTimer;
  document.getElementById('searchInput').addEventListener('input', e => {
    clearTimeout(searchTimer);
    const q = e.target.value.trim();
    searchTimer = setTimeout(() => { if (q.length > 1) location.hash = '#/recherche/' + encodeURIComponent(q); }, 300);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

  // ---------- Shared API for the admin space ----------
  window.SGDD = {
    store, K, esc, eur, toast, render, closeAll, catName, soldOut, mainImg, giftVisual,
    get catalog() { return catalog; }, set catalog(v) { catalog = v; },
    get settings() { return settings; },
    get orders() { return orders; },
    byId, saveCatalog, saveSettings, saveOrders,
    resetDemo() {
      Object.values(K).forEach(k => store.del(k));
      catalog = clone(window.PRODUCTS); settings = { ...DEFAULT_SETTINGS }; orders = seedOrders(); cart = [];
      saveCart(); renderDrawer();
    }
  };

  // ---------- Init ----------
  if (LIVE) {
    document.querySelectorAll('a[href="#/admin"]').forEach(a => a.remove());
    document.querySelectorAll('.footer-bottom span').forEach(s => { if (/démonstration/i.test(s.textContent)) s.remove(); });
  }
  document.getElementById('cartCount').textContent = cartCount();
  renderDrawer();
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', render);
  else render();
})();
