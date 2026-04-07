// ==========================================================================
// main.js — Funcionalidad global (menú, FAQ, tabs)
// todoseguros.pro
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

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

  // ========== FAQ Accordion ==========
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }

      btn.setAttribute('aria-expanded', !isActive);
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
