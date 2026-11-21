// Motion for the pitch pages: count-ups, growing bars, reveal on scroll.
// No libraries. Respects prefers-reduced-motion. Content is fully readable without JS.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  // Bar widths come from data attributes (CSP blocks inline style attributes; CSSOM is allowed).
  document.querySelectorAll('[data-v]').forEach(el => {
    el.style.setProperty('--v', el.dataset.v);
    if (el.dataset.d) el.style.setProperty('--d', el.dataset.d);
  });

  const show = (el, v) => {
    const dec = +(el.dataset.dec || 0);
    el.textContent = (el.dataset.pre || '') + v.toFixed(dec) + (el.dataset.suf || '');
  };
  const count = el => {
    const to = +el.dataset.count;
    if (reduce) return show(el, to);
    show(el, 0);
    setTimeout(() => {
      const t0 = performance.now(), dur = 1400;
      const step = t => {
        const p = Math.min(1, (t - t0) / dur);
        show(el, to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, +(el.dataset.delay || 0));
  };

  // Sticky nav: mark the section in view.
  const links = [...document.querySelectorAll('.bar-top nav a')];
  if (links.length && 'IntersectionObserver' in window) {
    const nio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) nio.observe(s); });
  }

  const start = el => {
    el.classList.add('on');
    el.querySelectorAll('[data-count]').forEach(count);
  };
  const targets = document.querySelectorAll('.anim');
  if (reduce || !('IntersectionObserver' in window)) return targets.forEach(start);
  targets.forEach(el => el.querySelectorAll('[data-count]').forEach(n => show(n, 0)));
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { start(e.target); io.unobserve(e.target); }
  }), { threshold: 0.2 });
  targets.forEach(el => io.observe(el));
})();
