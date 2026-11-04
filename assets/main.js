/* 4th Street Mini Storage: mobile nav and GA4 events. No dependencies. */
(function () {
  'use strict';

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  function setNav(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      setNav(!nav.classList.contains('is-open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setNav(false);
        toggle.focus();
      }
    });
  }

  /* GA4 events. gtag is injected by Site Kit; nothing fires until it exists. */
  function track(name, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params || {});
    }
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) {
      track('click_to_call', { link_text: a.textContent.trim(), page_location: location.href });
    } else if (a.classList.contains('js-reserve')) {
      track('reserve_click', { page_location: location.href });
    } else if (a.classList.contains('js-directions')) {
      track('directions_click', { page_location: location.href });
    }
  });

  if (document.body.classList.contains('page-thank-you')) {
    track('generate_lead', { page_location: location.href });
  }
})();

/* Attribution and form prefill. Remembers the first landing page and any UTM or gclid values for 30 days,
   fills the reserve form's hidden fields from them, and preselects the unit size from ?size=. */
(function () {
  'use strict';

  function readCookie(name) {
    var m = document.cookie.match('(?:^|; )' + name + '=([^;]*)');
    return m ? decodeURIComponent(m[1]) : '';
  }
  function writeCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + d.toUTCString() + '; path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
  }

  var attr = {};
  try { attr = JSON.parse(readCookie('fs_attr') || '{}') || {}; } catch (e) { attr = {}; }
  var q = new URLSearchParams(location.search);
  var fresh = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'gclid'].forEach(function (k) {
    if (q.get(k)) fresh[k] = q.get(k).slice(0, 200);
  });
  try {
    if (Object.keys(fresh).length) {
      attr = fresh;
      attr.landing_page = location.href.split('#')[0].slice(0, 500);
      writeCookie('fs_attr', JSON.stringify(attr), 30);
    } else if (!attr.landing_page) {
      attr = { landing_page: location.href.split('#')[0].slice(0, 500) };
      writeCookie('fs_attr', JSON.stringify(attr), 30);
    }
  } catch (e) { /* cookies blocked: the form still works, just without attribution */ }

  Object.keys(attr).forEach(function (k) {
    document.querySelectorAll('input[type="hidden"][name="' + k + '"]').forEach(function (el) {
      if (!el.value) el.value = attr[k];
    });
  });

  var size = q.get('size');
  var select = document.querySelector('select[name="unit_size"]');
  if (size && select) {
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value.toLowerCase() === size.toLowerCase()) {
        select.value = select.options[i].value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        break;
      }
    }
  }
})();

/* Review slider: arrows nudge the native scroll one card at a time; long reviews get a Read more toggle. */
(function () {
  'use strict';
  document.querySelectorAll('[data-slider]').forEach(function (slider) {
    var track = slider.querySelector('.reviews-track');
    if (!track) return;
    slider.querySelectorAll('.slider-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = track.querySelector('.review-card');
        var step = card ? card.getBoundingClientRect().width + 16 : 320;
        track.scrollBy({ left: step * Number(btn.getAttribute('data-dir')), behavior: 'smooth' });
      });
    });
    slider.querySelectorAll('.review-card').forEach(function (card) {
      var text = card.querySelector('.review-text');
      var more = card.querySelector('.read-more');
      if (!text || !more) return;
      text.classList.add('is-clamped');
      if (text.scrollHeight > text.clientHeight + 2) {
        more.hidden = false;
        more.addEventListener('click', function () {
          var open = text.classList.toggle('is-clamped') === false;
          more.textContent = open ? 'Show less' : 'Read more';
        });
      } else {
        text.classList.remove('is-clamped');
      }
    });
  });
})();
