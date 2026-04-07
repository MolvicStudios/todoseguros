// ==========================================================================
// comparator.js — Lógica del comparador de seguros
// todoseguros.pro
// ==========================================================================

class InsuranceComparator {
  constructor(type) {
    this.type = type;
    this.data = [];
    this.filters = { province: 'all', maxPrice: 999 };
  }

  async loadData() {
    try {
      const res = await fetch(`/data/companies-${this.type}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.data = await res.json();
    } catch {
      try {
        const res = await fetch(`../data/companies-${this.type}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.data = await res.json();
      } catch {
        this.data = [];
      }
    }
    return this;
  }

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

  getPrice(company) {
    return company.avg_monthly || company.avg_monthly_min || null;
  }

  renderCards(companies, container) {
    if (companies.length === 0) {
      container.innerHTML = '<div class="no-results"><p>No encontramos resultados para tus filtros.</p></div>';
      return;
    }

    // Sort: featured first, then by price
    companies.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      const priceA = this.getPrice(a) || 999;
      const priceB = this.getPrice(b) || 999;
      return priceA - priceB;
    });

    container.innerHTML = companies.map(c => {
      const price = this.getPrice(c);

      return `
        <article class="company-card ${c.featured ? 'company-card--featured' : ''}">
          ${c.featured ? '<div class="badge-featured">⭐ Destacado</div>' : ''}
          <div class="company-card__header">
            <div class="company-logo">
              <img src="/assets/img/logos/${c.logo}.svg" alt="${c.name}" width="80" height="40" loading="lazy"
                   onerror="this.style.display='none'">
            </div>
            <div class="company-meta">
              <h3 class="company-name">${c.name}</h3>
              ${c.market_share ? `<span class="market-share">${c.market_share} cuota de mercado</span>` : ''}
              ${c.rating ? `<span class="market-share">⭐ ${c.rating}/5</span>` : ''}
            </div>
          </div>
          <div class="company-card__price">
            ${price ? `
              <span class="price-label">Desde</span>
              <span class="price-amount">${price}€</span>
              <span class="price-period">/mes</span>
            ` : '<span class="price-label">Consultar precio</span>'}
          </div>
          <div class="company-card__features">
            ${c.online_quotes ? '<span class="feature-tag feature-tag--online">🖥️ Contratación online</span>' : ''}
            ${c.phone_spanish ? '<span class="feature-tag feature-tag--phone">📞 Atención telefónica</span>' : ''}
            ${c.app_mobile ? '<span class="feature-tag feature-tag--ok">✓ App móvil</span>' : ''}
          </div>
          <ul class="company-highlights">
            ${c.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
          <a href="${c.website}" target="_blank" rel="noopener nofollow" class="btn-primary btn-block">
            Ver ofertas →
          </a>
        </article>
      `;
    }).join('');
  }
}

// Provincias de España
const SPAIN_PROVINCES = [
  'A Coruña', 'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila',
  'Badajoz', 'Barcelona', 'Bizkaia', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria',
  'Castellón', 'Ceuta', 'Ciudad Real', 'Córdoba', 'Cuenca', 'Gipuzkoa', 'Girona',
  'Granada', 'Guadalajara', 'Huelva', 'Huesca', 'Illes Balears', 'Jaén',
  'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo', 'Madrid', 'Málaga',
  'Melilla', 'Murcia', 'Navarra', 'Ourense', 'Palencia', 'Pontevedra',
  'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria',
  'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Zamora', 'Zaragoza'
];

function populateProvinceDropdown(selectEl) {
  selectEl.innerHTML = '<option value="all">Todas las provincias</option>';
  SPAIN_PROVINCES.forEach(p => {
    selectEl.innerHTML += `<option value="${p}">${p}</option>`;
  });
}

// Initialize homepage comparator
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

  for (const type of types) {
    comparators[type] = new InsuranceComparator(type);
    await comparators[type].loadData();
  }

  function applyFilters() {
    const type = typeSelect.value;
    const province = provinceSelect.value;
    const maxPrice = parseInt(priceSelect.value) || 999;

    let allResults = [];
    if (type === 'all') {
      types.forEach(t => {
        allResults = allResults.concat(comparators[t].filter({ province, maxPrice }));
      });
    } else if (comparators[type]) {
      allResults = comparators[type].filter({ province, maxPrice });
    }

    const comp = type === 'all' ? comparators.coche : (comparators[type] || comparators.coche);
    comp.renderCards(allResults, container);
  }

  filterBtn.addEventListener('click', applyFilters);
  typeSelect.addEventListener('change', applyFilters);

  // Initial load — show coche companies
  if (comparators.coche.data.length > 0) {
    comparators.coche.renderCards(comparators.coche.data, container);
  }
}

document.addEventListener('DOMContentLoaded', initHomeComparator);
