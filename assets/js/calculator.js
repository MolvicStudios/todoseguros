// ==========================================================================
// calculator.js — Calculadora de presupuesto de seguros
// todoseguros.pro
// ==========================================================================

const CALCULATOR_DATA = {
  coche: {
    base: {
      'Madrid': 45, 'Barcelona': 48, 'Valencia': 38, 'Sevilla': 36,
      'Málaga': 40, 'Bilbao': 42, 'Zaragoza': 35, 'Murcia': 34,
      'Las Palmas': 37, 'Alicante': 36, 'A Coruña': 33, 'Asturias': 32
    },
    default: 38,
    terceros: 0.55,
    tercerosAmpliado: 0.75
  },
  moto: {
    default: 20
  },
  hogar: {
    alquiler: 12,
    propietario: 22
  },
  salud: {
    base: 55,
    perPerson: 40,
    ageMultipliers: [
      { maxAge: 30, mult: 0.8 },
      { maxAge: 45, mult: 1.0 },
      { maxAge: 60, mult: 1.4 },
      { maxAge: 999, mult: 1.9 }
    ]
  },
  vida: {
    per100k: 8,
    recommendedMultiple: 8
  },
  decesos: {
    default: 8
  },
  mascotas: {
    perro: 25,
    gato: 15
  }
};

function initCalculator() {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form || !results) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    calculateBudget();
  });
}

function calculateBudget() {
  const province = document.getElementById('calc-province').value;
  const people = parseInt(document.getElementById('calc-people').value) || 1;
  const age = parseInt(document.getElementById('calc-age').value) || 35;
  const income = parseInt(document.getElementById('calc-income').value) || 25000;
  const hasCar = document.getElementById('calc-car').checked;
  const hasMoto = document.getElementById('calc-moto').checked;
  const coverageType = document.getElementById('calc-coverage')?.value || 'todo-riesgo';
  const housingType = document.getElementById('calc-housing').value;
  const wantsHealth = document.getElementById('calc-health').checked;
  const wantsLife = document.getElementById('calc-life').checked;
  const wantsDecesos = document.getElementById('calc-decesos').checked;
  const hasPet = document.getElementById('calc-pet')?.value || 'no';

  let total = 0;
  const breakdown = [];

  // Seguro de Coche
  if (hasCar) {
    let carBase = CALCULATOR_DATA.coche.base[province] || CALCULATOR_DATA.coche.default;
    if (coverageType === 'terceros') carBase = Math.round(carBase * CALCULATOR_DATA.coche.terceros);
    else if (coverageType === 'terceros-ampliado') carBase = Math.round(carBase * CALCULATOR_DATA.coche.tercerosAmpliado);
    total += carBase;
    breakdown.push({
      type: `Seguro de Coche (${coverageType.replace('-', ' ')})`,
      amount: carBase,
      link: '/seguro-coche/'
    });
  }

  // Seguro de Moto
  if (hasMoto) {
    const motoPrice = CALCULATOR_DATA.moto.default;
    total += motoPrice;
    breakdown.push({
      type: 'Seguro de Moto',
      amount: motoPrice,
      link: '/seguro-moto/'
    });
  }

  // Seguro de Hogar
  if (housingType === 'alquiler') {
    const homePrice = CALCULATOR_DATA.hogar.alquiler;
    total += homePrice;
    breakdown.push({
      type: 'Seguro de Hogar (alquiler)',
      amount: homePrice,
      link: '/seguro-hogar/'
    });
  } else if (housingType === 'propiedad') {
    const homePrice = CALCULATOR_DATA.hogar.propietario;
    total += homePrice;
    breakdown.push({
      type: 'Seguro de Hogar (propiedad)',
      amount: homePrice,
      link: '/seguro-hogar/'
    });
  }

  // Seguro de Salud
  if (wantsHealth) {
    let healthBase = CALCULATOR_DATA.salud.base;
    healthBase += (people - 1) * CALCULATOR_DATA.salud.perPerson;
    let ageMult = 1.0;
    for (const tier of CALCULATOR_DATA.salud.ageMultipliers) {
      if (age <= tier.maxAge) {
        ageMult = tier.mult;
        break;
      }
    }
    const healthFinal = Math.round(healthBase * ageMult);
    total += healthFinal;
    breakdown.push({
      type: `Seguro de Salud (${people} persona${people > 1 ? 's' : ''})`,
      amount: healthFinal,
      note: `Ajuste por edad: x${ageMult}`,
      link: '/seguro-salud/'
    });
  }

  // Seguro de Vida
  if (wantsLife) {
    const coverage = income * CALCULATOR_DATA.vida.recommendedMultiple;
    const lifePrice = Math.round((coverage / 100000) * CALCULATOR_DATA.vida.per100k);
    total += lifePrice;
    breakdown.push({
      type: 'Seguro de Vida (temporal 20 años)',
      amount: lifePrice,
      note: `Cobertura recomendada: ${coverage.toLocaleString('es-ES')}€`,
      link: '/seguro-vida/'
    });
  }

  // Seguro de Decesos
  if (wantsDecesos) {
    const decesosPrice = CALCULATOR_DATA.decesos.default * people;
    total += decesosPrice;
    breakdown.push({
      type: 'Seguro de Decesos',
      amount: decesosPrice,
      link: '/seguro-decesos/'
    });
  }

  // Seguro de Mascotas
  if (hasPet === 'perro') {
    total += CALCULATOR_DATA.mascotas.perro;
    breakdown.push({
      type: 'Seguro de Mascotas (perro)',
      amount: CALCULATOR_DATA.mascotas.perro,
      link: '/seguro-mascotas/'
    });
  } else if (hasPet === 'gato') {
    total += CALCULATOR_DATA.mascotas.gato;
    breakdown.push({
      type: 'Seguro de Mascotas (gato)',
      amount: CALCULATOR_DATA.mascotas.gato,
      link: '/seguro-mascotas/'
    });
  }

  renderResults(total, breakdown);
}

function renderResults(total, breakdown) {
  const results = document.getElementById('calc-results');
  if (!results) return;

  results.innerHTML = `
    <div class="calc-total">
      <div class="calc-total__label">Estimación mensual total</div>
      <div class="calc-total__amount">${total}€<span>/mes</span></div>
    </div>
    <div class="calc-breakdown">
      <h3 style="margin-bottom:var(--space-4);font-family:var(--font-display);">Desglose</h3>
      ${breakdown.map(item => `
        <div class="calc-breakdown__item">
          <div class="calc-breakdown__type">
            <a href="${item.link}">${item.type}</a>
            ${item.note ? `<div class="calc-breakdown__note">${item.note}</div>` : ''}
          </div>
          <div class="calc-breakdown__amount">${item.amount}€/mes</div>
        </div>
      `).join('')}
    </div>
    <div class="calc-disclaimer">
      <p>⚠️ Estas son estimaciones aproximadas basadas en promedios nacionales. Los precios reales varían según tu perfil, aseguradora y provincia.</p>
    </div>
  `;

  results.style.display = 'block';
  results.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', initCalculator);
