// ==========================================================================
// comparator.js — Comparador unificado para todoseguros.pro
// Usado por la home (modo multi-tipo) y por TODAS las páginas de tipo
// ==========================================================================

class InsuranceComparator {
  constructor({ containerId = 'comparator-results', type, filterProvinceId, filterPriceId, filterBtnId } = {}) {
    this.container = document.getElementById(containerId);
    this.type = type;
    this.data = [];
    this.filterProvinceEl = document.getElementById(filterProvinceId || 'filter-province');
    this.filterPriceEl    = document.getElementById(filterPriceId    || 'filter-price');
    this.filterBtn        = document.getElementById(filterBtnId      || 'filter-btn');
    this.init();
  }

  async init() {
    if (!this.container || !this.type) return;
    this.showLoading();
    try {
      const res = await fetch(`/data/companies-${this.type}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.data = await res.json();
      this.render(this.data);
    } catch (e) {
      this.showError();
    }
    if (this.filterBtn) {
      this.filterBtn.addEventListener('click', () => this.applyFilters());
    }
  }

  applyFilters() {
    const province = this.filterProvinceEl?.value || 'all';
    const maxPrice = parseFloat(this.filterPriceEl?.value) || Infinity;
    const filtered = this.data.filter(c => {
      const provOk = province === 'all' ||
                     c.national === true ||
                     (Array.isArray(c.available_provinces) && c.available_provinces.includes(province));
      const price  = c.avg_monthly_min || c.avg_monthly || 0;
      const priceOk = !maxPrice || price === 0 || price <= maxPrice;
      return provOk && priceOk;
    });
    this.render(filtered);
  }

  render(companies) {
    if (!this.container) return;
    if (!companies || companies.length === 0) {
      this.container.innerHTML = `
        <div class="comparator-empty">
          <p>No encontramos aseguradoras con esos filtros. Prueba a ampliar la búsqueda.</p>
        </div>`;
      return;
    }
    const sorted = [...companies].sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.avg_monthly_min || a.avg_monthly || 999) - (b.avg_monthly_min || b.avg_monthly || 999);
    });
    this.container.innerHTML = `<div class="company-grid">${sorted.map(c => this.renderCard(c)).join('')}</div>`;
  }

  renderCard(c) {
    const price = c.avg_monthly_min || c.avg_monthly;
    const priceHtml = price
      ? `<div class="company-card__price"><span class="price-label">Desde</span> <span class="price-amount">${price}€</span><span class="price-period">/mes</span></div>`
      : `<div class="company-card__price"><span class="price-label">Consultar precio</span></div>`;

    const highlights = Array.isArray(c.highlights)
      ? `<ul class="company-highlights">${c.highlights.map(h => `<li>${h}</li>`).join('')}</ul>`
      : '';

    const features = [
      c.online_quotes   ? '<span class="feature-tag feature-tag--online">🖥️ Online</span>' : '',
      c.phone_spanish   ? '<span class="feature-tag feature-tag--phone">📞 Teléfono</span>' : '',
      c.app_mobile      ? '<span class="feature-tag feature-tag--ok">✓ App móvil</span>' : ''
    ].filter(Boolean).join('');

    const rating = c.rating
      ? `<span class="market-share">⭐ ${c.rating}/5</span>`
      : '';

    return `
      <article class="company-card ${c.featured ? 'company-card--featured' : ''}">
        ${c.featured ? '<div class="badge-featured">⭐ Destacado</div>' : ''}
        <div class="company-card__header">
          <div class="company-logo">
            <img src="/assets/img/logos/${c.logo || 'default'}.svg" alt="${c.name}" width="80" height="40" loading="lazy" onerror="this.style.display='none'">
          </div>
          <div class="company-meta">
            <h3 class="company-name">${c.name}</h3>
            ${c.market_share ? `<span class="market-share">${c.market_share} cuota de mercado</span>` : ''}
            ${rating}
          </div>
        </div>
        ${priceHtml}
        ${features ? `<div class="company-card__features">${features}</div>` : ''}
        ${highlights}
        <a href="${c.website || '#'}" target="_blank" rel="noopener nofollow" class="btn-primary btn-block">
          Ver ofertas →
        </a>
      </article>`;
  }

  showLoading() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="comparator-loading">
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      </div>`;
  }

  showError() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="comparator-error" role="alert">
        <p>⚠️ Error al cargar las aseguradoras.</p>
        <button onclick="location.reload()">Reintentar</button>
      </div>`;
  }

  // Legacy method — used by home page
  filter({ province, maxPrice }) {
    return this.data.filter(company => {
      const provinceOk = province === 'all' ||
        company.national === true ||
        (company.available_provinces && company.available_provinces.includes(province));
      const price = company.avg_monthly || company.avg_monthly_min || 0;
      const priceOk = !maxPrice || price === 0 || price <= maxPrice;
      return provinceOk && priceOk;
    });
  }

  renderCards(companies, container) {
    this.container = container || this.container;
    this.render(companies);
  }
}

// ── Provincias de España ─────────────────────────────────────────────────────
const SPAIN_PROVINCES = [
  'A Coruña', 'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila',
  'Badajoz', 'Barcelona', 'Bizkaia', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria',
  'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca', 'Gipuzkoa', 'Girona',
  'Granada', 'Guadalajara', 'Huelva', 'Huesca', 'Illes Balears', 'Jaén',
  'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo', 'Madrid', 'Málaga',
  'Murcia', 'Navarra', 'Ourense', 'Palencia', 'Pontevedra',
  'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria',
  'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Zamora', 'Zaragoza'
];

function populateProvinceDropdown(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = '<option value="all">Todas las provincias</option>';
  SPAIN_PROVINCES.forEach(p => {
    selectEl.innerHTML += `<option value="${p}">${p}</option>`;
  });
}

// ── Auto-inicializar para páginas de tipo (data-type en #comparator-results) ──
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('comparator-results');
  if (container && container.dataset.type) {
    // Populate province dropdown if present
    const provinceSelect = document.getElementById('filter-province');
    if (provinceSelect && !provinceSelect.options.length) {
      populateProvinceDropdown(provinceSelect);
    }
    new InsuranceComparator({ type: container.dataset.type });
    return; // Don't run home comparator on type pages
  }

  // ── Home page multi-type comparator ─────────────────────────────────────
  initHomeComparator();
});

async function initHomeComparator() {
  const container = document.getElementById('comparator-results');
  const typeSelect = document.getElementById('filter-type');
  const provinceSelect = document.getElementById('filter-province');
  const priceSelect = document.getElementById('filter-price');
  const filterBtn = document.getElementById('filter-btn');

  if (!container || !typeSelect) return;

  populateProvinceDropdown(provinceSelect);

  const comparators = {};
  const types = ['coche', 'moto', 'hogar', 'salud', 'vida', 'decesos', 'mascotas', 'viaje', 'comunidades', 'autonomos'];

  // Show skeleton while loading first type
  const tempComp = new InsuranceComparator({ type: 'coche' });
  tempComp.showLoading();

  for (const type of types) {
    try {
      const res = await fetch(`/data/companies-${type}.json`);
      const data = res.ok ? await res.json() : [];
      comparators[type] = { data };
    } catch { comparators[type] = { data: [] }; }
  }

  function applyFilters() {
    const type = typeSelect.value;
    const province = provinceSelect?.value || 'all';
    const maxPrice = parseInt(priceSelect?.value) || 999;

    const fakeComp = new InsuranceComparator({ type: type === 'all' ? 'coche' : type });
    fakeComp.container = container;

    let results = [];
    if (type === 'all') {
      types.forEach(t => {
        (comparators[t]?.data || []).forEach(c => {
          const provOk = province === 'all' || c.national || (Array.isArray(c.available_provinces) && c.available_provinces.includes(province));
          const price  = c.avg_monthly_min || c.avg_monthly || 0;
          const priceOk = price === 0 || price <= maxPrice;
          if (provOk && priceOk) results.push(c);
        });
      }) ;
    } else {
      (comparators[type]?.data || []).forEach(c => {
        const provOk = province === 'all' || c.national || (Array.isArray(c.available_provinces) && c.available_provinces.includes(province));
        const price  = c.avg_monthly_min || c.avg_monthly || 0;
        const priceOk = price === 0 || price <= maxPrice;
        if (provOk && priceOk) results.push(c);
      });
    }

    fakeComp.render(results);
  }

  filterBtn?.addEventListener('click', applyFilters);
  typeSelect.addEventListener('change', applyFilters);

  // Initial render
  applyFilters();
}
