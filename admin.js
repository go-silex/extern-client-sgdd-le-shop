// Espace gérant (démo) : tableau de bord, commandes, articles, réglages.
// Everything is stored in the visitor's browser (localStorage), through window.SGDD.
(() => {
  const S = () => window.SGDD;
  const STATUSES = ['À préparer', 'Prête en boutique', 'Expédiée', 'Retirée', 'Livrée', 'Annulée'];
  const statusClass = s => ({ 'À préparer': 'st-todo', 'Prête en boutique': 'st-ready', 'Expédiée': 'st-ship', 'Retirée': 'st-done', 'Livrée': 'st-done', 'Annulée': 'st-cancel' }[s] || '');
  const SIZE_PRESETS = { Adulte: 'XS, S, M, L, XL, XXL', Enfant: '4 ans, 6 ans, 8 ans, 10 ans, 12 ans', Unique: 'Unique' };

  let draft = null;           // product being edited
  let ui = { q: '', cat: 'all', status: 'all', libraryOpen: false };

  const fmtDate = ts => new Date(ts).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) + ' · ' + new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'article';
  const thumb = p => p.giftCard ? `<div class="adm-thumb">${S().giftVisual()}</div>` : `<div class="adm-thumb"><img src="${S().esc(S().mainImg(p))}" alt=""></div>`;

  // ---------- Shell ----------
  function shell(active, title, actions, body) {
    const { esc } = S();
    const todo = S().orders.filter(o => o.status === 'À préparer').length;
    const link = (href, key, label, extra = '') => `<a href="#/admin${href}" class="${active === key ? 'active' : ''}">${label}${extra}</a>`;
    return `
      <div class="adm">
        <aside class="adm-side">
          <a href="#/admin" class="logo"><span class="logo-sgdd">SGDD</span><span class="logo-shop">Le Shop</span></a>
          <div class="adm-role">Espace gérant · Marco</div>
          <nav class="adm-nav">
            ${link('', 'home', 'Tableau de bord')}
            ${link('/commandes', 'orders', 'Commandes', todo ? `<span class="adm-pill">${todo}</span>` : '')}
            ${link('/produits', 'products', 'Articles')}
            ${link('/reglages', 'settings', 'Réglages')}
          </nav>
          <div class="adm-side-foot">
            <a href="#/" class="adm-link-site">Voir le site ↗</a>
            <button data-adm="reset" class="adm-ghost">Réinitialiser la démo</button>
            <button data-adm="logout" class="adm-ghost">Se déconnecter</button>
          </div>
        </aside>
        <section class="adm-main">
          <div class="adm-demo">Démo : les modifications restent dans ce navigateur. Aucun email réel n'est envoyé.</div>
          <header class="adm-top"><h1>${esc(title)}</h1><div class="adm-actions">${actions || ''}</div></header>
          ${body}
        </section>
      </div>`;
  }

  function login() {
    return `
      <div class="adm-login">
        <div class="adm-login-card">
          <a href="#/" class="logo logo-lg"><span class="logo-sgdd">SGDD</span><span class="logo-shop">Le Shop</span></a>
          <h1>Espace gérant</h1>
          <p>Gérer les articles, les stocks, les commandes et les réglages du site.</p>
          <button class="btn btn-primary btn-block" data-adm="login">Entrer comme Marco (démo)</button>
          <a href="#/" class="adm-back">← Retour au site</a>
        </div>
      </div>`;
  }

  // ---------- Dashboard ----------
  function dashboard() {
    const { eur, esc, orders, catalog } = S();
    const now = Date.now(), day = 86400000;
    const valid = orders.filter(o => o.status !== 'Annulée');
    const last30 = valid.filter(o => now - o.date < 30 * day);
    const ca = last30.reduce((a, o) => a + o.total, 0);
    const avg = last30.length ? ca / last30.length : 0;
    const todo = orders.filter(o => o.status === 'À préparer');
    const low = catalog.filter(p => !p.giftCard && p.active !== false && p.stock <= 3).sort((a, b) => a.stock - b.stock);

    // revenue per day, last 14 days
    const days = [...Array(14)].map((_, i) => {
      const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (13 - i));
      const t0 = start.getTime();
      return { label: start.toLocaleDateString('fr-FR', { day: '2-digit' }), wd: start.toLocaleDateString('fr-FR', { weekday: 'narrow' }), v: valid.filter(o => o.date >= t0 && o.date < t0 + day).reduce((a, o) => a + o.total, 0) };
    });
    const max = Math.max(50, ...days.map(d => d.v));
    const W = 640, H = 200, bw = W / 14;
    const bars = days.map((d, i) => {
      const h = Math.round(d.v / max * (H - 40));
      return `<g><rect x="${i * bw + 8}" y="${H - 24 - h}" width="${bw - 16}" height="${Math.max(h, 2)}" rx="5" class="${i === 13 ? 'bar-today' : 'bar'}"><title>${d.label} : ${eur(d.v)}</title></rect>
        <text x="${i * bw + bw / 2}" y="${H - 6}" text-anchor="middle" class="axis">${d.label}</text></g>`;
    }).join('');

    // best sellers by quantity
    const qty = {};
    valid.forEach(o => o.lines.forEach(l => { qty[l.id] = (qty[l.id] || 0) + l.qty; }));
    const top = Object.entries(qty).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => ({ p: S().byId(id), n })).filter(x => x.p);

    const body = `
      <div class="adm-kpis">
        <div class="kpi"><span>Chiffre d'affaires 30 j</span><strong>${eur(ca)}</strong></div>
        <div class="kpi"><span>Commandes 30 j</span><strong>${last30.length}</strong></div>
        <div class="kpi"><span>Panier moyen</span><strong>${eur(avg)}</strong></div>
        <div class="kpi ${todo.length ? 'kpi-alert' : ''}"><span>À préparer</span><strong>${todo.length}</strong></div>
      </div>
      <div class="adm-grid2">
        <div class="adm-card">
          <div class="adm-card-head"><h2>Ventes des 14 derniers jours</h2></div>
          <svg viewBox="0 0 ${W} ${H}" class="adm-chart" role="img" aria-label="Ventes par jour">${bars}</svg>
        </div>
        <div class="adm-card">
          <div class="adm-card-head"><h2>Meilleures ventes</h2></div>
          <ol class="adm-top5">${top.map(x => `<li>${thumb(x.p)}<a href="#/admin/produits/${x.p.id}">${esc(x.p.name)}</a><b>${x.n}</b></li>`).join('') || '<li>Aucune vente</li>'}</ol>
        </div>
      </div>
      <div class="adm-grid2">
        <div class="adm-card">
          <div class="adm-card-head"><h2>Commandes à préparer</h2><a href="#/admin/commandes">Toutes →</a></div>
          ${todo.length ? `<div class="adm-table-wrap"><table class="adm-table"><tbody>${todo.slice(0, 6).map(o => `
            <tr><td><a href="#/admin/commandes/${o.no}"><b>${o.no}</b></a><br><small>${esc(o.name)}</small></td>
              <td>${o.ship === 'collect' ? 'Click & collect' : 'Colissimo'}</td><td class="num">${eur(o.total)}</td>
              <td class="right"><button class="adm-btn-sm" data-adm="advance" data-no="${o.no}">${o.ship === 'collect' ? 'Marquer prête' : 'Marquer expédiée'}</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="adm-empty">Rien à préparer.</p>'}
        </div>
        <div class="adm-card">
          <div class="adm-card-head"><h2>Stock à surveiller</h2><a href="#/admin/produits">Articles →</a></div>
          ${low.length ? `<div class="adm-table-wrap"><table class="adm-table"><tbody>${low.map(p => `
            <tr><td class="adm-prod">${thumb(p)}<a href="#/admin/produits/${p.id}">${esc(p.name)}</a></td>
              <td class="right"><span class="stock ${p.stock === 0 ? 'stock-out' : 'stock-low'}">${p.stock === 0 ? 'Épuisé' : p.stock + ' restant' + (p.stock > 1 ? 's' : '')}</span></td>
              <td class="right"><button class="adm-btn-sm" data-adm="restock" data-id="${p.id}">+10</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="adm-empty">Tous les stocks sont bons.</p>'}
        </div>
      </div>`;
    return shell('home', 'Tableau de bord', `<a class="btn btn-secondary" href="#/admin/produits/nouveau">+ Nouvel article</a>`, body);
  }

  // ---------- Orders ----------
  function ordersView(no) {
    const { eur, esc, orders } = S();
    const list = orders.filter(o => ui.status === 'all' || o.status === ui.status);
    const sel = no ? orders.find(o => o.no === no) : null;
    const chips = ['all', ...STATUSES].map(s => {
      const n = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
      return `<button class="chip ${ui.status === s ? 'active' : ''}" data-adm="filter-status" data-v="${esc(s)}">${s === 'all' ? 'Toutes' : esc(s)} <small>${n}</small></button>`;
    }).join('');
    const detail = sel ? `
      <div class="adm-card adm-order">
        <div class="adm-card-head"><h2>Commande ${sel.no}</h2><a href="#/admin/commandes" aria-label="Fermer">✕</a></div>
        <p class="adm-meta">${fmtDate(sel.date)} · ${esc(sel.name)} · ${esc(sel.email)}<br>${sel.ship === 'collect' ? 'Click & collect, 7 place de Verdun' : 'Colissimo à domicile'}</p>
        <table class="adm-table">
          ${sel.lines.map(l => `<tr><td>${esc(l.name)}<br><small>${esc([l.color, l.size].filter(x => x && x !== 'Unique').join(' · '))}</small></td><td class="num">× ${l.qty}</td><td class="num">${eur(l.price * l.qty)}</td></tr>`).join('')}
          <tr class="adm-total"><td>Total TTC</td><td></td><td class="num">${eur(sel.total)}</td></tr>
        </table>
        <label class="adm-field"><span>Statut</span>
          <select data-adm-status="${sel.no}">${STATUSES.map(s => `<option ${s === sel.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
        </label>
        <p class="adm-hint">En production, le client reçoit un email à chaque changement de statut.</p>
      </div>` : '';
    const body = `
      <div class="adm-filters">${chips}</div>
      <div class="${sel ? 'adm-split' : ''}">
        <div class="adm-card adm-card-flush">
          <div class="adm-table-wrap"><table class="adm-table adm-table-lg">
            <thead><tr><th>N°</th><th>Date</th><th>Client</th><th>Mode</th><th class="num">Total</th><th>Statut</th></tr></thead>
            <tbody>${list.map(o => `
              <tr class="${sel && sel.no === o.no ? 'selected' : ''}" data-adm-row="${o.no}">
                <td><b>${o.no}</b></td><td>${fmtDate(o.date)}</td><td>${esc(o.name)}</td>
                <td>${o.ship === 'collect' ? 'Click & collect' : 'Colissimo'}</td><td class="num">${eur(o.total)}</td>
                <td><span class="status ${statusClass(o.status)}">${esc(o.status)}</span></td></tr>`).join('') || '<tr><td colspan="6" class="adm-empty">Aucune commande</td></tr>'}
            </tbody></table></div>
        </div>
        ${detail}
      </div>`;
    return shell('orders', 'Commandes', `<button class="btn btn-secondary" data-adm="export">Exporter CSV</button>`, body);
  }

  // ---------- Products ----------
  function productsView() {
    const { eur, esc, catalog, catName } = S();
    const q = ui.q.toLowerCase();
    const list = catalog.filter(p => (ui.cat === 'all' || p.cat === ui.cat) && (!q || (p.name + ' ' + p.type).toLowerCase().includes(q)));
    const body = `
      <div class="adm-filters">
        <input type="search" class="adm-search" placeholder="Rechercher un article" value="${esc(ui.q)}" data-adm-input="q">
        <select data-adm-select="cat"><option value="all">Tous les rayons</option>${window.CATEGORIES.map(c => `<option value="${c.id}" ${ui.cat === c.id ? 'selected' : ''}>${esc(c.short)}</option>`).join('')}</select>
        <span class="adm-count">${list.length} article${list.length > 1 ? 's' : ''}</span>
      </div>
      <div class="adm-card adm-card-flush">
        <div class="adm-table-wrap"><table class="adm-table adm-table-lg">
          <thead><tr><th>Article</th><th>Rayon</th><th class="num">Prix</th><th class="center">Stock</th><th class="center">En ligne</th><th></th></tr></thead>
          <tbody>${list.map(p => `
            <tr class="${p.active === false ? 'is-off' : ''}">
              <td class="adm-prod">${thumb(p)}<div><a href="#/admin/produits/${p.id}"><b>${esc(p.name)}</b></a><br><small>${esc(p.type)}${p.priceConfirmed === false ? ' · <span class="tag-warn">prix à valider</span>' : ''}</small></div></td>
              <td>${esc(catName(p.cat))}</td>
              <td class="num"><input type="number" min="0" step="1" class="adm-price" value="${p.price}" data-adm-price="${p.id}" aria-label="Prix"> €</td>
              <td class="center">${p.giftCard ? '<small>illimité</small>' : `<div class="adm-stock"><button data-adm="stock" data-id="${p.id}" data-d="-1" aria-label="Moins">−</button><span class="stock ${p.stock === 0 ? 'stock-out' : p.stock <= 3 ? 'stock-low' : ''}">${p.stock}</span><button data-adm="stock" data-id="${p.id}" data-d="1" aria-label="Plus">+</button></div>`}</td>
              <td class="center"><label class="switch"><input type="checkbox" data-adm-active="${p.id}" ${p.active !== false ? 'checked' : ''}><i></i></label></td>
              <td class="right"><a class="adm-btn-sm" href="#/admin/produits/${p.id}">Modifier</a></td>
            </tr>`).join('')}</tbody></table></div>
      </div>`;
    return shell('products', 'Articles', `<a class="btn btn-primary" href="#/admin/produits/nouveau">+ Nouvel article</a>`, body);
  }

  function editView(id) {
    const { esc, byId } = S();
    const isNew = id === 'nouveau';
    if (!draft || draft._key !== id) {
      const src = isNew ? { id: '', cat: 'sgdd', type: 'T-shirt', name: '', price: 29, stock: 10, badge: '', imgs: [], colors: [{ name: 'Blanc', hex: '#f7f5ef' }], sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], desc: '', details: [], active: true, priceConfirmed: true } : byId(id);
      if (!src) return shell('products', 'Article introuvable', '', '<p class="adm-empty">Cet article n\'existe plus.</p>');
      draft = JSON.parse(JSON.stringify(src)); draft._key = id;
    }
    const d = draft;
    const lib = ui.libraryOpen ? `
      <div class="adm-library">
        <div class="adm-card-head"><h2>Bibliothèque photos (boutique + Facebook)</h2><button class="adm-ghost" data-adm="lib-close">Fermer</button></div>
        <div class="adm-lib-grid">${window.PHOTO_LIBRARY.map(src => `<button data-adm="lib-pick" data-src="${esc(src)}" class="${d.imgs.includes(src) ? 'picked' : ''}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('')}</div>
      </div>` : '';
    const body = `
      <form class="adm-form" data-form="adm-product">
        <div class="adm-form-main">
          <div class="adm-card">
            <h2>Informations</h2>
            <label class="adm-field"><span>Nom de l'article</span><input required data-f="name" value="${esc(d.name)}" placeholder="Ex. Hoodie Phare & Chopper"></label>
            <div class="adm-row3">
              <label class="adm-field"><span>Rayon</span><select data-f="cat">${window.CATEGORIES.map(c => `<option value="${c.id}" ${d.cat === c.id ? 'selected' : ''}>${esc(c.short)}</option>`).join('')}</select></label>
              <label class="adm-field"><span>Type</span><input data-f="type" value="${esc(d.type)}" list="types"></label>
              <label class="adm-field"><span>Pastille</span><input data-f="badge" value="${esc(d.badge || '')}" placeholder="Nouveau, Best-seller..."></label>
            </div>
            <datalist id="types">${['Hoodie', 'Sweat', 'T-shirt', 'Veste', 'Polo', 'Casquette', 'Accessoire', 'Skate', 'Surf', 'Déco'].map(t => `<option>${t}</option>`).join('')}</datalist>
            <label class="adm-field"><span>Description</span><textarea rows="3" data-f="desc">${esc(d.desc)}</textarea></label>
            <label class="adm-field"><span>Détails (un par ligne)</span><textarea rows="3" data-f="details">${esc((d.details || []).join('\n'))}</textarea></label>
          </div>

          <div class="adm-card">
            <div class="adm-card-head"><h2>Photos</h2>
              <div class="adm-photo-actions">
                <button type="button" class="adm-btn-sm" data-adm="lib-open">Choisir dans la bibliothèque</button>
                <label class="adm-btn-sm adm-upload">Importer une photo<input type="file" accept="image/*" data-adm-upload hidden></label>
              </div>
            </div>
            ${d.giftCard ? '<p class="adm-hint">La carte cadeau utilise un visuel généré.</p>' : `
            <div class="adm-photos">${d.imgs.map((src, i) => `
              <div class="adm-photo ${i === 0 ? 'main' : ''}"><img src="${esc(src)}" alt="">
                ${i === 0 ? '<span class="adm-photo-tag">Principale</span>' : `<button type="button" data-adm="img-main" data-i="${i}" title="Mettre en principale">★</button>`}
                <button type="button" class="del" data-adm="img-del" data-i="${i}" title="Retirer">✕</button></div>`).join('') || '<p class="adm-empty">Aucune photo. Ajoutez-en une.</p>'}</div>`}
            ${lib}
          </div>

          <div class="adm-card">
            <div class="adm-card-head"><h2>Couleurs</h2><button type="button" class="adm-btn-sm" data-adm="color-add">+ Couleur</button></div>
            ${d.colors.map((c, i) => `
              <div class="adm-color-row">
                <input type="color" value="${esc(c.hex)}" data-color-hex="${i}" aria-label="Teinte">
                <input value="${esc(c.name)}" data-color-name="${i}" aria-label="Nom de la couleur">
                ${d.giftCard ? `<input type="number" value="${c.price || ''}" data-color-price="${i}" aria-label="Montant" style="max-width:100px">` : ''}
                ${d.colors.length > 1 ? `<button type="button" class="adm-ghost" data-adm="color-del" data-i="${i}" aria-label="Supprimer">✕</button>` : ''}
              </div>`).join('')}
            <h2 style="margin-top:20px">Tailles</h2>
            <div class="adm-presets">${Object.keys(SIZE_PRESETS).map(k => `<button type="button" class="chip" data-adm="sizes" data-v="${k}">${k}</button>`).join('')}</div>
            <label class="adm-field"><span>Tailles proposées (séparées par des virgules)</span><input data-f="sizes" value="${esc(d.sizes.join(', '))}"></label>
          </div>
        </div>

        <aside class="adm-form-side">
          <div class="adm-card">
            <h2>Prix & stock</h2>
            <label class="adm-field"><span>Prix TTC (€)</span><input type="number" min="0" step="0.5" required data-f="price" value="${d.price}"></label>
            ${d.giftCard ? '' : `<label class="adm-field"><span>Stock</span><input type="number" min="0" step="1" data-f="stock" value="${d.stock}"></label>`}
            <label class="adm-check"><input type="checkbox" data-f="active" ${d.active !== false ? 'checked' : ''}> En ligne sur le site</label>
            <label class="adm-check"><input type="checkbox" data-f="priceConfirmed" ${d.priceConfirmed !== false ? 'checked' : ''}> Prix validé par Marco</label>
          </div>
          <div class="adm-card adm-preview">
            <h2>Aperçu</h2>
            <div class="card-media ${d.fit === 'contain' ? 'contain' : ''}">${d.giftCard ? S().giftVisual() : d.imgs[0] ? `<img src="${esc(d.imgs[0])}" alt="">` : '<div class="adm-noimg">Pas de photo</div>'}${d.badge ? `<span class="badge">${esc(d.badge)}</span>` : ''}</div>
            <div class="card-body"><div class="card-type">${esc(d.type)}</div><div class="card-name">${esc(d.name || 'Nom de l\'article')}</div><span class="price">${S().eur(d.price || 0)}</span></div>
          </div>
          <button class="btn btn-primary btn-block" type="submit">${isNew ? 'Créer l\'article' : 'Enregistrer'}</button>
          ${isNew ? '' : `<a class="btn btn-secondary btn-block" href="#/p/${d.id}" target="_blank">Voir sur le site ↗</a>
          <button type="button" class="adm-danger" data-adm="delete">Supprimer l'article</button>`}
        </aside>
      </form>`;
    return shell('products', isNew ? 'Nouvel article' : d.name, `<a class="btn btn-secondary" href="#/admin/produits">← Articles</a>`, body);
  }

  // ---------- Settings ----------
  function settingsView() {
    const { esc, settings } = S();
    const body = `
      <form class="adm-form adm-form-narrow" data-form="adm-settings">
        <div class="adm-card">
          <h2>Bandeau d'annonce</h2>
          <label class="adm-field"><span>Message en haut du site (optionnel)</span><input name="announce" value="${esc(settings.announce)}" placeholder="Ex. -20 % sur les hoodies ce week-end"></label>
        </div>
        <div class="adm-card">
          <h2>Livraison</h2>
          <div class="adm-row3">
            <label class="adm-field"><span>Livraison offerte dès (€)</span><input type="number" min="0" name="freeShip" value="${settings.freeShip}"></label>
            <label class="adm-field"><span>Frais Colissimo (€)</span><input type="number" min="0" step="0.1" name="shipCost" value="${settings.shipCost}"></label>
          </div>
          <label class="adm-check"><input type="checkbox" name="collect" ${settings.collect ? 'checked' : ''}> Proposer le click & collect place de Verdun</label>
        </div>
        <div class="adm-card">
          <h2>Boutique</h2>
          <label class="adm-field"><span>Horaires / message pratique</span><textarea rows="2" name="hours">${esc(settings.hours)}</textarea></label>
          <label class="adm-field"><span>Email de réception des commandes</span><input type="email" name="email" value="${esc(settings.email)}"></label>
        </div>
        <button class="btn btn-primary" type="submit">Enregistrer les réglages</button>
      </form>`;
    return shell('settings', 'Réglages', '', body);
  }

  // ---------- Router entry (called by app.js) ----------
  function render(section, arg) {
    if (!S().store.get(S().K.admin, false)) return login();
    if (section !== 'produits' || !arg) { draft = null; ui.libraryOpen = false; }
    if (section === 'commandes') return ordersView(arg);
    if (section === 'produits') return arg ? editView(arg) : productsView();
    if (section === 'reglages') return settingsView();
    return dashboard();
  }

  // ---------- Events ----------
  const rerender = () => { const y = window.scrollY; S().render(); window.scrollTo(0, y); };

  function readImage(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => {
        const img = new Image();
        img.onload = () => {
          const k = Math.min(1, 900 / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          res(c.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = rej; img.src = r.result;
      };
      r.onerror = rej; r.readAsDataURL(file);
    });
  }

  function advance(o) {
    o.status = o.ship === 'collect' ? 'Prête en boutique' : 'Expédiée';
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-adm],[data-adm-row]');
    if (!t) return;
    const api = S(); const d = t.dataset;
    if (d.admRow && !e.target.closest('select,button,a')) { location.hash = '#/admin/commandes/' + d.admRow; return; }
    switch (d.adm) {
      case 'login': api.store.set(api.K.admin, true); rerender(); break;
      case 'logout': api.store.del(api.K.admin); location.hash = '#/'; break;
      case 'reset':
        if (confirm('Remettre la démo à zéro ? Articles, stocks, commandes et réglages reviennent à leur état initial.')) { api.resetDemo(); api.store.set(api.K.admin, true); draft = null; api.toast('Démo réinitialisée'); location.hash = '#/admin'; rerender(); }
        break;
      case 'advance': { const o = api.orders.find(x => x.no === d.no); advance(o); api.saveOrders(); api.toast(`${o.no} : ${o.status}`); rerender(); break; }
      case 'restock': { const p = api.byId(d.id); p.stock += 10; api.saveCatalog(); api.toast(`${p.name} : stock ${p.stock}`); rerender(); break; }
      case 'stock': { const p = api.byId(d.id); p.stock = Math.max(0, p.stock + Number(d.d)); api.saveCatalog(); rerender(); break; }
      case 'filter-status': ui.status = d.v; rerender(); break;
      case 'export': {
        const rows = [['N°', 'Date', 'Client', 'Email', 'Mode', 'Total', 'Statut'], ...api.orders.map(o => [o.no, new Date(o.date).toISOString(), o.name, o.email, o.ship, o.total, o.status])];
        const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' })); a.download = 'commandes-sgdd.csv'; a.click();
        break;
      }
      case 'lib-open': ui.libraryOpen = true; rerender(); break;
      case 'lib-close': ui.libraryOpen = false; rerender(); break;
      case 'lib-pick': if (!draft.imgs.includes(d.src)) draft.imgs.push(d.src); else draft.imgs = draft.imgs.filter(s => s !== d.src); rerender(); break;
      case 'img-del': draft.imgs.splice(Number(d.i), 1); rerender(); break;
      case 'img-main': { const [x] = draft.imgs.splice(Number(d.i), 1); draft.imgs.unshift(x); rerender(); break; }
      case 'color-add': draft.colors.push({ name: 'Nouvelle couleur', hex: '#cccccc' }); rerender(); break;
      case 'color-del': draft.colors.splice(Number(d.i), 1); rerender(); break;
      case 'sizes': draft.sizes = SIZE_PRESETS[d.v].split(',').map(s => s.trim()); rerender(); break;
      case 'delete':
        if (confirm(`Supprimer « ${draft.name} » du catalogue ?`)) {
          api.catalog = api.catalog.filter(p => p.id !== draft.id); api.saveCatalog();
          api.toast('Article supprimé'); draft = null; location.hash = '#/admin/produits';
        }
        break;
    }
  });

  // Live edits in the product form keep the draft in sync (no re-render, so focus stays).
  document.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.admInput === 'q') {
      ui.q = el.value; clearTimeout(ui._t);
      ui._t = setTimeout(() => { rerender(); const s = document.querySelector('.adm-search'); if (s) { s.focus(); s.setSelectionRange(s.value.length, s.value.length); } }, 250);
      return;
    }
    if (!draft) return;
    const f = el.dataset.f;
    if (f === 'details') draft.details = el.value.split('\n').map(s => s.trim()).filter(Boolean);
    else if (f === 'sizes') draft.sizes = el.value.split(',').map(s => s.trim()).filter(Boolean);
    else if (f === 'price' || f === 'stock') draft[f] = Number(el.value);
    else if (f === 'active' || f === 'priceConfirmed') draft[f] = el.checked;
    else if (f) draft[f] = el.value;
    if (el.dataset.colorName) draft.colors[el.dataset.colorName].name = el.value;
    if (el.dataset.colorHex) draft.colors[el.dataset.colorHex].hex = el.value;
    if (el.dataset.colorPrice) draft.colors[el.dataset.colorPrice].price = Number(el.value);
  });

  document.addEventListener('change', async e => {
    const el = e.target; const api = S();
    if (el.dataset.admSelect === 'cat') { ui.cat = el.value; rerender(); return; }
    if (el.dataset.admStatus) {
      const o = api.orders.find(x => x.no === el.dataset.admStatus); o.status = el.value; api.saveOrders(); api.toast(`${o.no} : ${o.status}`); rerender(); return;
    }
    if (el.dataset.admPrice) {
      const p = api.byId(el.dataset.admPrice); p.price = Math.max(0, Number(el.value) || 0); p.priceConfirmed = true;
      api.saveCatalog(); api.toast(`${p.name} : ${api.eur(p.price)}`); rerender(); return;
    }
    if (el.dataset.admActive) {
      const p = api.byId(el.dataset.admActive); p.active = el.checked; api.saveCatalog();
      api.toast(p.active ? `${p.name} est en ligne` : `${p.name} est masqué`); rerender(); return;
    }
    if (el.hasAttribute('data-adm-upload') && el.files[0]) {
      try { draft.imgs.push(await readImage(el.files[0])); rerender(); }
      catch { api.toast('Image illisible'); }
    }
  });

  document.addEventListener('submit', e => {
    const f = e.target.dataset.form; const api = S();
    if (f === 'adm-product') {
      e.preventDefault();
      if (!draft.name.trim()) { api.toast('Donnez un nom à l\'article'); return; }
      if (!draft.colors.length || !draft.sizes.length) { api.toast('Au moins une couleur et une taille'); return; }
      const isNew = draft._key === 'nouveau';
      const clean = { ...draft }; delete clean._key;
      if (isNew) {
        let id = slugify(clean.name); let n = 2;
        while (api.byId(id)) id = slugify(clean.name) + '-' + n++;
        clean.id = id; api.catalog.unshift(clean);
      } else {
        const i = api.catalog.findIndex(p => p.id === clean.id); api.catalog[i] = clean;
      }
      if (!api.saveCatalog()) { api.toast('Stockage du navigateur plein : retirez une photo importée'); return; }
      api.toast(isNew ? 'Article créé' : 'Article enregistré');
      draft = null; location.hash = '#/admin/produits';
    }
    if (f === 'adm-settings') {
      e.preventDefault();
      const fd = new FormData(e.target); const s = api.settings;
      s.announce = fd.get('announce').trim(); s.freeShip = Number(fd.get('freeShip')) || 0; s.shipCost = Number(fd.get('shipCost')) || 0;
      s.collect = fd.get('collect') === 'on'; s.hours = fd.get('hours').trim(); s.email = fd.get('email').trim();
      api.saveSettings(); api.toast('Réglages enregistrés'); rerender();
    }
  });

  window.SGDD_ADMIN = { render };
})();
