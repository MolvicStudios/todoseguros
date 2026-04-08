// ==========================================================================
// calculator.js — Calculadora de presupuesto de seguros
// todoseguros.pro
// ==========================================================================

// ── Precios base por tipo (España 2025) ─────────────────────────────
const PRECIOS_BASE = {
  coche:       { min: 25,  max: 55  },
  moto:        { min: 8,   max: 35  },
  hogar:       { min: 12,  max: 35  },
  salud:       { min: 42,  max: 120 },
  vida:        { min: 12,  max: 80  },
  decesos:     { min: 7,   max: 20  },
  mascotas:    { min: 8,   max: 30  },
  viaje:       { min: 3,   max: 15  },
  comunidades: { min: 10,  max: 40  },
  autonomos:   { min: 25,  max: 90  }
};

// ── Multiplicadores por provincia ───────────────────────────────────
const MULT_PROVINCIA = {
  madrid: 1.18, barcelona: 1.22, valencia: 1.05, sevilla: 0.98,
  malaga: 1.08, bilbao: 1.12, zaragoza: 0.95, murcia: 0.92,
  palma: 1.15, las_palmas: 1.02, tenerife: 1.02, alicante: 1.03,
  cordoba: 0.93, valladolid: 0.95, vigo: 0.97, gijon: 0.94,
  hospitalet: 1.18, coruna: 0.95, granada: 0.96, cadiz: 0.94,
  otra: 1.0
};

const NOMBRES_SEGURO = {
  coche:       '🚗 Seguro de Coche',
  moto:        '🏍️ Seguro de Moto',
  hogar:       '🏠 Seguro de Hogar',
  salud:       '🏥 Seguro de Salud',
  vida:        '❤️ Seguro de Vida',
  decesos:     '⚱️ Seguro de Decesos',
  mascotas:    '🐾 Seguro de Mascotas',
  viaje:       '✈️ Seguro de Viaje',
  comunidades: '🏢 Comunidades de Propietarios',
  autonomos:   '💼 Seguro de Autónomos'
};

// ── Leer campos del formulario ──────────────────────────────────────
function getFormData() {
  return {
    province: document.getElementById('calc-province')?.value || 'otra',
    people:   parseInt(document.getElementById('calc-people')?.value) || 1,
    age:      parseInt(document.getElementById('calc-age')?.value)    || 35,
    income:   parseInt(document.getElementById('calc-income')?.value) || 25000,
    housing:  document.getElementById('calc-housing')?.value || 'propietario',
    sqm:      parseInt(document.getElementById('calc-sqm')?.value) || 80,
    dogs:     parseInt(document.getElementById('calc-dogs')?.value)   || 0,
    cats:     parseInt(document.getElementById('calc-cats')?.value)   || 0,
    types: Array.from(
      document.querySelectorAll('input[name="types"]:checked')
    ).map(el => el.value)
  };
}

// ── Función principal de cálculo ─────────────────────────────────────
function calcular(e) {
  if (e) e.preventDefault();
  const data = getFormData();

  if (data.types.length === 0) {
    mostrarError('Selecciona al menos un tipo de seguro.');
    return;
  }

  const mult = MULT_PROVINCIA[data.province] || 1.0;
  const multPersonas = data.people > 1 ? 1 + (data.people - 1) * 0.3 : 1;

  let totalMin = 0;
  let totalMax = 0;
  const desglose = [];

  data.types.forEach(tipo => {
    const precio = PRECIOS_BASE[tipo];
    if (!precio) return;

    let min = Math.round(precio.min * mult);
    let max = Math.round(precio.max * mult);

    // Ajuste por número de personas en salud, vida y decesos
    if (['salud', 'vida', 'decesos'].includes(tipo)) {
      min = Math.round(min * multPersonas);
      max = Math.round(max * multPersonas);
    }

    // Ajuste por tipo de vivienda en hogar
    if (tipo === 'hogar' && data.housing === 'alquiler') {
      min = Math.round(min * 0.55);
      max = Math.round(max * 0.55);
    }

    // Ajuste por superficie en hogar
    if (tipo === 'hogar') {
      const sqmMult = data.sqm / 80;
      min = Math.round(min * sqmMult);
      max = Math.round(max * sqmMult);
    }

    // Ajuste por edad en salud
    if (tipo === 'salud') {
      let ageMult = data.age < 30 ? 0.8 : data.age < 45 ? 1.0 : data.age < 60 ? 1.4 : 1.9;
      min = Math.round(min * ageMult);
      max = Math.round(max * ageMult);
    }

    // Ajuste por mascotas adicionales
    if (tipo === 'mascotas' && (data.dogs + data.cats) > 1) {
      const extra = (data.dogs + data.cats - 1) * 0.6;
      min = Math.round(min * (1 + extra));
      max = Math.round(max * (1 + extra));
    }

    totalMin += min;
    totalMax += max;
    desglose.push({ tipo, min, max });
  });

  mostrarResultado(totalMin, totalMax, desglose);
}

// ── Mostrar resultado ────────────────────────────────────────────────
function mostrarResultado(totalMin, totalMax, desglose) {
  const resultEl = document.getElementById('calculator-results');
  if (!resultEl) return;

  const breakdownEl = document.getElementById('results-breakdown');
  const totalEl     = document.getElementById('results-total');

  if (breakdownEl) {
    breakdownEl.innerHTML = desglose.map(item => `
      <div class="calc-breakdown__item">
        <div class="calc-breakdown__type">
          <a href="/seguro-${item.tipo}/">${NOMBRES_SEGURO[item.tipo] || item.tipo}</a>
        </div>
        <div class="calc-breakdown__amount">${item.min}€ — ${item.max}€/mes</div>
      </div>
    `).join('');
  }

  if (totalEl) {
    totalEl.innerHTML = `
      <div class="calc-total__label">Estimación mensual total</div>
      <div class="calc-total__amount">${totalMin}€ — ${totalMax}€<span>/mes</span></div>
    `;
  }

  resultEl.style.display = 'block';
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function mostrarError(msg) {
  const resultEl = document.getElementById('calculator-results');
  if (!resultEl) return;
  resultEl.innerHTML = `<div class="calc-error" role="alert">${msg}</div>`;
  resultEl.style.display = 'block';
}

// ── Inicializar ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calculator-form');
  if (form) form.addEventListener('submit', calcular);
});
