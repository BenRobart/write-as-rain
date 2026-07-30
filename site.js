/* Write as Rain — shared behaviour: mobile menu, theme toggle, privacy popup, scroll reveal. */
(function () {
  'use strict';

  // Flag JS as available before anything else. The reveal/stagger rules only hide
  // content under .js, so with scripting off the page renders fully rather than blank.
  document.documentElement.classList.add('js');

  // --- Mobile menu ---
  var menuToggle = document.getElementById('menu-toggle');
  var navLinks = document.getElementById('nav-links');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --- Theme toggle (persisted where storage is available) ---
  var themeToggle = document.getElementById('theme-toggle');
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    if (themeToggle) themeToggle.innerHTML = t === 'dark' ? '&#9788;' : '&#9790;';
    try { localStorage.setItem('theme', t); } catch (e) { /* storage unavailable; theme just won't persist */ }
  }
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (saved === 'dark' || (!saved && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    setTheme('dark');
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  // --- Privacy popup ---
  (function () {
    var btn = document.getElementById('privacyBtn');
    var popup = document.getElementById('privacyPopup');
    var closeBtn = document.getElementById('privacyPopupClose');
    if (!btn || !popup || !closeBtn) return;

    function isOpen() { return popup.getAttribute('aria-hidden') === 'false'; }

    function openPopup() {
      popup.setAttribute('aria-hidden', 'false');
      btn.setAttribute('aria-expanded', 'true');
      closeBtn.focus();
    }

    function closePopup(returnFocus) {
      popup.setAttribute('aria-hidden', 'true');
      btn.setAttribute('aria-expanded', 'false');
      if (returnFocus) btn.focus();
    }

    btn.addEventListener('click', function () { isOpen() ? closePopup(true) : openPopup(); });
    closeBtn.addEventListener('click', function () { closePopup(true); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) closePopup(true);
    });
    document.addEventListener('click', function (e) {
      if (!isOpen()) return;
      if (popup.contains(e.target) || btn.contains(e.target)) return;
      closePopup(false);
    });
  })();

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Reveal on scroll (also drives .stagger and .section-title rules) ---
  var revealEls = document.querySelectorAll('.reveal, .stagger, .section-title');
  if ('IntersectionObserver' in window && !reduced) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { obs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // --- Reading progress bar + nav shadow, both driven by one scroll handler ---
  var bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  var nav = document.querySelector('nav');
  var ticking = false;

  function onScroll() {
    var top = window.pageYOffset || document.documentElement.scrollTop;
    var height = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (height > 0 ? Math.min(top / height, 1) : 0) + ')';
    if (nav) nav.classList.toggle('scrolled', top > 12);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // --- Only one accordion open at a time within a list, so panels don't stack ---
  document.querySelectorAll('.faq-list, .services-list').forEach(function (list) {
    list.addEventListener('toggle', function (e) {
      var d = e.target;
      if (d.tagName !== 'DETAILS' || !d.open) return;
      list.querySelectorAll('details[open]').forEach(function (other) {
        if (other !== d) other.open = false;
      });
    }, true);
  });
})();
