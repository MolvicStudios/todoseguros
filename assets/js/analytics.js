// ==========================================================================
// analytics.js — Tracking de eventos
// todoseguros.pro
// ==========================================================================

(function() {
  'use strict';

  function trackPageView() {
    if (typeof window.__analytics !== 'undefined') {
      window.__analytics.push({ event: 'pageview', page: window.location.pathname });
    }
  }

  function trackEvent(category, action, label) {
    if (typeof window.__analytics !== 'undefined') {
      window.__analytics.push({ event: 'custom', category, action, label });
    }
    if (window.location.hostname === 'localhost') {
      console.log('[Analytics]', category, action, label);
    }
  }

  document.addEventListener('click', function(e) {
    const link = e.target.closest('a[target="_blank"]');
    if (link) {
      trackEvent('outbound', 'click', link.href);
    }
  });

  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn-primary, .btn-secondary');
    if (btn) {
      const label = btn.textContent.trim().substring(0, 50);
      trackEvent('cta', 'click', label);
    }
  });

  document.addEventListener('click', function(e) {
    if (e.target.closest('.filter-bar__btn')) {
      trackEvent('comparator', 'filter', 'applied');
    }
  });

  window.trackEvent = trackEvent;
  window.__analytics = window.__analytics || [];
  trackPageView();
})();
