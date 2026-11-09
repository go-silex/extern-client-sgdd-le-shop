/* SGDD Le Shop theme: menu, search, cart drawer (Shopify AJAX API), variant picker. */
(() => {
  const CFG = window.SGDD_CFG || { freeShipCents: 8000, routes: { cart: '/cart', cartAdd: '/cart/add', cartChange: '/cart/change', root: '/' } };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = cents => (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const overlay = $('#overlay');
  const drawer = $('#cartDrawer');
  const checkoutUrl = (CFG.routes.root.replace(/\/$/, '')) + '/checkout';

  function toast(msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400);
  }
  function closeAll() {
    drawer?.classList.remove('open'); drawer?.setAttribute('aria-hidden', 'true');
    $('#nav')?.classList.remove('open');
    if (overlay) overlay.hidden = true;
  }

  // ---------- Cart drawer ----------
  async function getCart() {
    const r = await fetch(CFG.routes.cart + '.js', { headers: { Accept: 'application/json' } });
    return r.json();
  }
  function setCount(n) {
    const el = $('#cartCount'); if (!el) return;
    el.textContent = n; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }
  function shipBlock(total) {
    const t = CFG.freeShipCents;
    if (!t) return '';
    if (total >= t) return `<div class="ship-progress">Livraison offerte, c'est bon pour vous.<div class="ship-bar"><i style="width:100%"></i></div></div>`;
    return `<div class="ship-progress">Plus que <b>${money(t - total)}</b> pour la livraison offerte.<div class="ship-bar"><i style="width:${Math.round(total / t * 100)}%"></i></div></div>`;
  }
  function renderDrawer(cart) {
    const lines = cart.items.map(it => `
      <div class="line">
        <div class="line-img">${it.image ? `<img src="${esc(it.image + (it.image.includes('?') ? '&' : '?') + 'width=200')}" alt="">` : ''}</div>
        <div>
          <a class="line-name" href="${esc(it.url)}">${esc(it.product_title)}</a>
          ${it.variant_title ? `<div class="line-meta">${esc(it.variant_title.replace(/ \/ /g, ' · '))}</div>` : ''}
          <div class="qty"><button type="button" data-line-qty="${esc(it.key)}" data-q="${it.quantity - 1}" aria-label="Retirer un">−</button><span>${it.quantity}</span><button type="button" data-line-qty="${esc(it.key)}" data-q="${it.quantity + 1}" aria-label="Ajouter un">+</button></div>
        </div>
        <div class="line-right">
          <strong>${money(it.final_line_price)}</strong>
          <button type="button" class="remove" data-line-qty="${esc(it.key)}" data-q="0">Retirer</button>
        </div>
      </div>`).join('');
    drawer.innerHTML = `
      <div class="drawer-head"><h3>Votre panier</h3><button class="icon-btn" type="button" data-action="close" aria-label="Fermer">✕</button></div>
      <div class="drawer-body">${cart.item_count ? lines : `<div class="empty"><p class="script">Panier vide</p><p>Allez faire un tour du côté des hoodies.</p></div>`}</div>
      ${cart.item_count ? `
        <div class="drawer-foot">
          ${shipBlock(cart.total_price)}
          <div class="totals"><div class="grand"><span>Total</span><span>${money(cart.total_price)}</span></div></div>
          <a class="btn btn-primary btn-block" href="${checkoutUrl}">Valider ma commande</a>
          <a class="btn btn-secondary btn-block" href="${CFG.routes.cart}">Voir le panier</a>
          <p class="demo-note">Pas de paiement en ligne : Marco vous recontacte pour le règlement.</p>
        </div>` : ''}`;
  }
  async function openDrawer(cart) {
    if (!drawer) { location.href = CFG.routes.cart; return; }
    renderDrawer(cart || await getCart());
    drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); overlay.hidden = false;
  }
  async function changeLine(key, quantity) {
    const r = await fetch(CFG.routes.cartChange + '.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ id: key, quantity }) });
    const cart = await r.json();
    if (!r.ok) { toast(cart.description || 'Stock maximum atteint'); return; }
    setCount(cart.item_count); renderDrawer(cart);
  }
  async function addToCart(body) {
    const r = await fetch(CFG.routes.cartAdd + '.js', { method: 'POST', headers: { Accept: 'application/json' }, body });
    const data = await r.json();
    if (!r.ok) { toast(data.description || 'Impossible d\'ajouter cet article'); return false; }
    const cart = await getCart();
    setCount(cart.item_count); openDrawer(cart); toast('Ajouté au panier');
    return true;
  }

  // ---------- Product page ----------
  function initProduct(root) {
    const jsonEl = $('[data-product-json]', root);
    if (!jsonEl) return;
    const product = JSON.parse(jsonEl.textContent);
    const stock = JSON.parse($('[data-inventory-json]', root)?.textContent || '{}');
    const form = $('.js-product-form', root);
    const idInput = $('[data-variant-id]', root);
    const btn = $('[data-add-button]', root);
    const priceEl = $('[data-price]', root);
    const lowEl = $('[data-low-stock]', root);
    const mainImg = $('#pdpMain', root);
    const groups = $$('[data-option-index]', root);
    const selected = groups.map(g => $('.active', g)?.dataset.value ?? null);

    function update() {
      const v = product.variants.find(v => v.options.every((o, i) => o === selected[i]));
      groups.forEach((g, i) => { $('[data-option-value]', g).textContent = selected[i] || ''; });
      if (!v) { btn.disabled = true; btn.textContent = 'Indisponible'; return; }
      idInput.value = v.id;
      priceEl.textContent = money(v.price);
      btn.disabled = !v.available;
      btn.textContent = v.available ? 'Ajouter au panier' : 'Épuisé';
      const left = stock[v.id];
      lowEl.hidden = !(v.available && left !== null && left !== undefined && left <= 3);
      if (!lowEl.hidden) lowEl.textContent = `Plus que ${left} en stock`;
      if (v.featured_image && mainImg) { mainImg.src = v.featured_image.src + (v.featured_image.src.includes('?') ? '&' : '?') + 'width=1100'; mainImg.removeAttribute('srcset'); }
      // grey out values with no available variant given the other choices
      groups.forEach((g, gi) => $$('[data-value]', g).forEach(b => {
        const ok = product.variants.some(x => x.available && x.options[gi] === b.dataset.value && x.options.every((o, oi) => oi === gi || o === selected[oi]));
        b.classList.toggle('is-unavailable', !ok);
      }));
      const url = new URL(location.href); url.searchParams.set('variant', v.id); history.replaceState(null, '', url);
    }
    groups.forEach((g, gi) => g.addEventListener('click', e => {
      const b = e.target.closest('[data-value]'); if (!b) return;
      $$('[data-value]', g).forEach(x => x.classList.toggle('active', x === b));
      selected[gi] = b.dataset.value; update();
    }));
    $$('[data-thumb]', root).forEach(t => t.addEventListener('click', () => {
      if (mainImg) { mainImg.src = t.dataset.thumb; mainImg.removeAttribute('srcset'); }
      $$('[data-thumb]', root).forEach(x => x.classList.toggle('active', x === t));
    }));
    $$('[data-qty]', root).forEach(b => b.addEventListener('click', () => {
      const i = $('[data-qty-input]', root); i.value = Math.max(1, Number(i.value || 1) + Number(b.dataset.qty));
    }));
    form?.addEventListener('submit', async e => {
      e.preventDefault();
      btn.disabled = true;
      await addToCart(new FormData(form));
      update();
    });
    if (groups.length) update();
  }

  // ---------- Global events ----------
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-action],[data-quick-variant],[data-line-qty]');
    if (!t) { if (e.target === overlay) closeAll(); return; }
    if (t.dataset.quickVariant) {
      e.preventDefault();
      const fd = new FormData(); fd.append('id', t.dataset.quickVariant); fd.append('quantity', '1');
      addToCart(fd); return;
    }
    if (t.dataset.lineQty) { changeLine(t.dataset.lineQty, Number(t.dataset.q)); return; }
    switch (t.dataset.action) {
      case 'cart': e.preventDefault(); openDrawer(); break;
      case 'close': closeAll(); break;
      case 'menu': $('#nav').classList.add('open'); overlay.hidden = false; break;
      case 'search': {
        const bar = $('#searchBar'); bar.hidden = !bar.hidden;
        if (!bar.hidden) $('input[type=search]', bar).focus();
        break;
      }
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  document.addEventListener('change', e => {
    if (e.target.matches('[data-sort]')) {
      const url = new URL(location.href); url.searchParams.set('sort_by', e.target.value); url.searchParams.delete('page'); location.href = url;
    }
  });

  $$('[data-product-section]').forEach(initProduct);
})();
