// ==========================================================================
// main.js — Funcionalidad global (menú, FAQ, tabs, AdSense)
// todoseguros.pro
// ==========================================================================

// ========== AdSense — inicialización lazy (evita availableWidth=0) ==========
function initAdSlot(ins) {
  if (!ins) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.offsetWidth > 0) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch(e) {
          console.warn('AdSense init skipped:', e.message);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  observer.observe(ins);
}

document.addEventListener('DOMContentLoaded', () => {

  // Inicializar slots AdSense con lazy loading
  document.querySelectorAll('ins.adsbygoogle').forEach(initAdSlot);

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
