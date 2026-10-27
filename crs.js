/* CRS comps — shared behavior. Two jobs only:
   1. Header shadow on scroll (same logic previously inlined per page).
   2. YouTube facade: .yt[data-yt] slots show our art-directed poster;
      click/Enter/Space swaps in the youtube-nocookie iframe. Keeps the
      page fast (no embed JS until asked) and keeps posters real photos.
   Everything else on the site is CSS-only by design — no observers. */
(function () {
  var h = document.getElementById('siteHeader');
  if (h) {
    var s = function () { h.classList.toggle('scrolled', window.scrollY > 16); };
    s(); window.addEventListener('scroll', s, { passive: true });
  }

  function playYT(el) {
    if (!el || el.dataset.loaded) return;
    el.dataset.loaded = '1';
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + el.dataset.yt + '?autoplay=1&rel=0';
    f.title = el.dataset.vtitle || 'CRS Horseshoes video';
    f.allow = 'autoplay; encrypted-media; picture-in-picture';
    f.allowFullscreen = true;
    el.appendChild(f);
    var host = el.closest && el.closest('.hero-b, .hero-film');
    if (host) { host.classList.add('is-playing'); var hl = host.querySelector('video'); if (hl) hl.pause(); }
  }
  // ?state=final forces every animation to its finished state (review/screenshots)
  if (/[?&]state=final\b/.test(location.search)) document.documentElement.classList.add('state-final');
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-yt-trigger]');
    if (t) { playYT(document.querySelector(t.getAttribute('data-yt-trigger'))); return; }
    var y = e.target.closest && e.target.closest('.yt[data-yt]');
    if (y) playYT(y);
  });
  // close the hero film and go back to the loop
  document.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('[data-film-close]');
    if (!c) return;
    var host = c.closest('.hero-film'); if (!host) return;
    var y = host.querySelector('.yt[data-loaded]');
    if (y) { var f = y.querySelector('iframe'); if (f) f.remove(); delete y.dataset.loaded; }
    host.classList.remove('is-playing');
    var v = host.querySelector('video'); if (v && v.src) v.play().catch(function(){});
  });

  // hero loop: silent, muted, poster-first; only fetched once on screen,
  // never under reduced motion, paused when scrolled away (COMPONENTS P5)
  var loop = document.querySelector('.hero-loop video[data-src]');
  if (loop && loop.dataset.src && !matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          if (!loop.src) { loop.src = loop.dataset.src; loop.addEventListener('error', function(){ loop.remove(); }); }
          loop.play().then(function(){ loop.classList.add('is-on'); }).catch(function(){});
        } else if (loop.src) { loop.pause(); }
      });
    }, { threshold: 0.15 }).observe(loop);
  }

  // product shots tilt toward the cursor (fine pointer + motion allowed only)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.buy-img').forEach(function (box) {
      var img = box.querySelector('.ph-img'); if (!img) return;
      box.addEventListener('pointermove', function (e) {
        var r = box.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        img.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg'); img.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
      });
      box.addEventListener('pointerleave', function () { img.style.setProperty('--ry', '0deg'); img.style.setProperty('--rx', '0deg'); });
    });
  }

  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('yt')) {
      e.preventDefault(); playYT(e.target);
    }
  });
})();
