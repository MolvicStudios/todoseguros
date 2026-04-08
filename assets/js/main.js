// ==========================================================================
// main.js — Funcionalidad global (menú, FAQ, tabs, AdSense)
// todoseguros.pro
// ==========================================================================

// ========== AdSense — inicialización lazy (evita availableWidth=0) ==========
function initAdSlot(ins) {
  if (!ins) return;
  const container = ins.closest('.ad-container');

  // Skip ads inside hidden containers (e.g. display:none on mobile)
  if (container && getComputedStyle(container).display === 'none') return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Defer to next frame so layout is fully resolved
      requestAnimationFrame(() => {
        const w = container ? container.offsetWidth : ins.offsetWidth;
        if (w < 50) return; // still hidden / too narrow — observer will retry on next intersection
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch(e) {
          console.warn('AdSense init skipped:', e.message);
        }
        observer.unobserve(ins);
      });
    });
  }, { threshold: 0.1 });
  observer.observe(ins);
}

document.addEventListener('DOMContentLoaded', () => {

  // Inicializar slots AdSense con lazy loading
  const adSlots = document.querySelectorAll('ins.adsbygoogle');
  adSlots.forEach(initAdSlot);

  // Re-attempt hidden ad slots on resize (e.g. device rotation)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      adSlots.forEach(ins => {
        if (ins.dataset.adStatus) return; // already initialized by AdSense
        initAdSlot(ins);
      });
    }, 300);
  });

  // ========== Mobile Menu ==========
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Cerrar menú mobile al hacer clic fuera de él
  document.addEventListener('click', (e) => {
    if (mobileNav && hamburger && mobileNav.classList.contains('open')) {
      if (!mobileNav.contains(e.target) && !hamburger.contains(e.target)) {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Cerrar menú mobile al cambiar tamaño de ventana
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && mobileNav) {
      mobileNav.classList.remove('open');
      if (hamburger) {
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // ========== FAQ Accordion accesible ==========
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    const id = `faq-${Math.random().toString(36).slice(2, 8)}`;
    answer.id = id;
    question.id = id + '-q';
    question.setAttribute('aria-controls', id);
    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');
    answer.setAttribute('role', 'region');
    answer.setAttribute('aria-labelledby', id + '-q');
    answer.style.display = 'none';

    function toggle() {
      const isOpen = answer.style.display !== 'none';
      answer.style.display = isOpen ? 'none' : 'block';
      question.setAttribute('aria-expanded', String(!isOpen));
      item.classList.toggle('is-open', !isOpen);
      item.classList.toggle('active', !isOpen);
    }

    question.addEventListener('click', toggle);
    question.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  // ========== Hero Tabs (link to pages) ==========
  document.querySelectorAll('.hero-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.hero-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

});
