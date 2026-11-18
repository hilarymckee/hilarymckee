// Hilary McKee, hilarymckee.ca: shared site scripts.
// Interactions only. All copy lives in the HTML.

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('site-menu');
  if (toggle && menu) {
    var setMenu = function (open) {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); toggle.focus(); }
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  }

  // Lazy background images (below the fold)
  var lazy = document.querySelectorAll('.lazy-bg');
  if (lazy.length) {
    if ('IntersectionObserver' in window) {
      var bgObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('bg-in'); bgObserver.unobserve(entry.target); }
        });
      }, { rootMargin: '300px 0px' });
      lazy.forEach(function (el) { bgObserver.observe(el); });
    } else {
      lazy.forEach(function (el) { el.classList.add('bg-in'); });
    }
  }

  // Breathing pause: runs only after the button is pressed, stops after 60 seconds
  var breathe = document.querySelector('.breathe');
  var breatheBtn = document.querySelector('.breathe-btn');
  if (breathe && breatheBtn) {
    var timer;
    var setBreathing = function (on) {
      clearTimeout(timer);
      breathe.classList.toggle('breathing', on);
      breatheBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) { timer = setTimeout(function () { setBreathing(false); }, 60000); }
    };
    breatheBtn.addEventListener('click', function () { setBreathing(!breathe.classList.contains('breathing')); });
  }

  // Myth flip cards
  document.querySelectorAll('.myth').forEach(function (card) {
    card.addEventListener('click', function () {
      card.setAttribute('aria-pressed', card.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });

  // Guides: category filter, sort and count. The full list shows without JS.
  var grid = document.querySelector('.guide-grid');
  if (grid) {
    var controls = document.querySelector('.controls');
    var chips = document.querySelectorAll('.chip');
    var sorts = document.querySelectorAll('.sorter button');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.guide-card'));
    var counts = document.querySelectorAll('.count [data-count]');
    var state = { cat: 'all', sort: 'new' };
    var fromHash = decodeURIComponent((location.hash || '').slice(1));
    chips.forEach(function (c) { if (c.getAttribute('data-cat') === fromHash) state.cat = fromHash; });

    var render = function () {
      cards.sort(function (a, b) {
        var da = a.getAttribute('data-date'), db = b.getAttribute('data-date');
        return state.sort === 'new' ? db.localeCompare(da) : da.localeCompare(db);
      }).forEach(function (card) {
        card.hidden = !(state.cat === 'all' || card.getAttribute('data-cat') === state.cat);
        grid.appendChild(card);
      });
      var shown = cards.filter(function (c) { return !c.hidden; }).length;
      counts.forEach(function (el) { el.hidden = el.getAttribute('data-count') !== String(shown === 1 ? 1 : 'n'); });
      var n = document.querySelector('.count [data-n]');
      if (n) n.textContent = shown;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-cat') === state.cat ? 'true' : 'false'); });
      sorts.forEach(function (s) { s.setAttribute('aria-pressed', s.getAttribute('data-sort') === state.sort ? 'true' : 'false'); });
    };
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        state.cat = c.getAttribute('data-cat');
        history.replaceState(null, '', state.cat === 'all' ? location.pathname : '#' + state.cat);
        render();
      });
    });
    sorts.forEach(function (s) {
      s.addEventListener('click', function () { state.sort = s.getAttribute('data-sort'); render(); });
    });
    if (controls) controls.hidden = false;
    render();
  }

  // Contact forms: send to Formspree without leaving the page
  document.querySelectorAll('form.contact-form').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var button = form.querySelector('button[type="submit"]');
      var old = form.querySelector('.form-status');
      if (old) old.hidden = true;
      if (button) button.disabled = true;
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error('Form submission failed');
          var ok = form.parentNode.querySelector('.form-ok');
          if (ok) { ok.hidden = false; form.hidden = true; ok.focus(); }
        })
        .catch(function () {
          var err = form.querySelector('.form-error');
          if (err) err.hidden = false;
          if (button) button.disabled = false;
        });
    });
  });

  // External links open in a new tab
  document.querySelectorAll('a[href]').forEach(function (link) {
    if (link.hostname && link.hostname !== window.location.hostname && link.protocol.indexOf('http') === 0) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // Smooth scroll for same-page anchors, unless reduced motion is set
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || a.classList.contains('skip-link')) return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        history.pushState(null, '', id);
      }
    });
  });
});
