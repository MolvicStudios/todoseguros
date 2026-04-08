// ── Nav hamburger ────────────────────────────────────────────
const toggle = document.getElementById('nav-toggle');
const panel  = document.getElementById('nav-mobile');

if (toggle && panel) {
  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('is-open');
    toggle.classList.toggle('is-active', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  document.addEventListener('click', e => {
    if (panel.classList.contains('is-open') && !panel.contains(e.target) && !toggle.contains(e.target)) {
      panel.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    }
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      panel.classList.remove('is-open');
      toggle.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  });
}

// ── Marcar nav-link activo según URL ─────────────────────────
document.querySelectorAll('.nav-link, .nav-mobile-link').forEach(link => {
  if (link.href && window.location.pathname.startsWith(new URL(link.href, location.href).pathname) && link.getAttribute('href') !== '/') {
    link.classList.add('active');
  }
});

// ── FAQ Accordion accesible ───────────────────────────────────
document.querySelectorAll('.faq-item').forEach((item, idx) => {
  const q = item.querySelector('.faq-question');
  const a = item.querySelector('.faq-answer');
  if (!q || !a) return;
  const id = `faq-answer-${idx}`;
  a.id = id;
  q.setAttribute('aria-controls', id);
  q.setAttribute('aria-expanded', 'false');
  q.setAttribute('role', 'button');
  q.setAttribute('tabindex', '0');
  a.setAttribute('role', 'region');

  function toggle() {
    const open = item.classList.toggle('is-open');
    q.setAttribute('aria-expanded', open);
    if (open) a.focus();
  }
  q.addEventListener('click', toggle);
  q.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
});

// ── Smooth scroll CTAs ────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Mini comparador hero ──────────────────────────────────────
function heroCompare() {
  const type = document.querySelector('input[name="hero-type"]:checked')?.value || 'coche';
  const province = document.getElementById('hero-province')?.value || 'todas';
  const url = `/seguro-${type}/?provincia=${encodeURIComponent(province)}`;
  window.location.href = url;
}
