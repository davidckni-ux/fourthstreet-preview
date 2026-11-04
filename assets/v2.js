/* Home page design mock: header compacting, mobile nav, reveal on scroll, review slider. No dependencies. */
document.documentElement.classList.add('js');
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-compact', window.scrollY > 24); }
  if (header) { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }); }

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');
  function setNav(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setNav(!nav.classList.contains('is-open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setNav(false); toggle.focus(); }
    });
  }

  var targets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  var track = document.querySelector('[data-slider] .reviews-track');
  if (track) {
    document.querySelectorAll('[data-slider-controls] .slider-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = track.querySelector('.review-card');
        var step = card ? card.getBoundingClientRect().width + 20 : 380;
        track.scrollBy({ left: step * Number(btn.getAttribute('data-dir')), behavior: 'smooth' });
      });
    });
  }
})();
