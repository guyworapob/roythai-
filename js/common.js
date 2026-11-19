/* Shared behaviour: Lenis smooth scroll, page transition, custom cursor,
   magnetic buttons, text mask reveal, scroll reveal, mouse parallax helper. */
(() => {
  const root = document.documentElement;
  if (!window.gsap || !window.ScrollTrigger) {               // CDN failed -> fall back to a static page
    root.classList.remove('js-anim');
    window.RT = { motionOK: false, fine: false, ready: Promise.resolve(), parallax() {},
      scrollTo: sel => { const el = document.querySelector(sel); if (el) el.scrollIntoView(); } };
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const motionOK = root.classList.contains('js-anim');       // false when user prefers reduced motion
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches; // mouse devices only
  let resolveReady; const ready = new Promise(r => (resolveReady = r));
  const RT = (window.RT = { motionOK, fine, ready });

  /* Smooth scroll: Lenis drives ScrollTrigger through GSAP's ticker */
  let lenis = null;
  if (motionOK && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  RT.scrollTo = sel => {
    const el = document.querySelector(sel); if (!el) return;
    lenis ? lenis.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto' });
  };
  document.querySelectorAll('a[href^="#"]').forEach(a =>
    a.addEventListener('click', e => { e.preventDefault(); RT.scrollTo(a.getAttribute('href')); }));

  /* Page transition: a red curtain wipes up on load, and wipes in before navigating */
  const curtain = document.querySelector('.curtain');
  if (motionOK && curtain) {
    const reveal = () => {
      gsap.set(curtain, { yPercent: 0 });
      gsap.to(curtain, { yPercent: -100, duration: 1, ease: 'power4.inOut', delay: 0.2,
        onStart: () => setTimeout(resolveReady, 500) });      // page intro starts as the curtain lifts
    };
    reveal();
    addEventListener('pageshow', e => { if (e.persisted) reveal(); });
    document.querySelectorAll('a[data-transition]').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      gsap.fromTo(curtain, { yPercent: 100 }, { yPercent: 0, duration: 0.85, ease: 'power4.inOut',
        onComplete: () => (location.href = a.href) });
    }));
  } else resolveReady();

  /* Custom cursor (desktop with a mouse only) */
  if (motionOK && fine) {
    root.classList.add('has-cursor');
    const dot = Object.assign(document.createElement('div'), { className: 'cur-dot' });
    const ring = Object.assign(document.createElement('div'), { className: 'cur-ring' });
    document.body.append(ring, dot);
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    const dx = gsap.quickTo(dot, 'x', { duration: 0.08 }), dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
    const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
    addEventListener('mousemove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.addEventListener('mouseover', e => ring.classList.toggle('on', !!e.target.closest('a,button,input,textarea,label')));
  }

  /* Magnetic buttons: pulled toward the pointer, elastic snap-back */
  if (motionOK && fine) document.querySelectorAll('.magnetic').forEach(b => {
    const qx = gsap.quickTo(b, 'x', { duration: 0.7, ease: 'elastic.out(1,.4)' });
    const qy = gsap.quickTo(b, 'y', { duration: 0.7, ease: 'elastic.out(1,.4)' });
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * 0.35); qy((e.clientY - r.top - r.height / 2) * 0.35);
    });
    b.addEventListener('mouseleave', () => { qx(0); qy(0); });
  });

  /* Text mask reveal: words slide up from behind an overflow mask */
  if (motionOK) {
    document.querySelectorAll('[data-split]').forEach(el => {
      el.setAttribute('aria-label', el.textContent.trim());
      el.innerHTML = el.textContent.trim().split(/\s+/).map(w => `<span class="w" aria-hidden="true"><span>${w}</span></span>`).join(' ');
      gsap.from(el.querySelectorAll('.w>span'), { yPercent: 115, duration: 1.1, ease: 'power4.out', stagger: 0.07,
        scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    document.querySelectorAll('[data-reveal]').forEach(el =>
      gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
  }

  /* Mouse parallax: layers = [{el, depth}] (px of travel; negative = opposite direction) */
  RT.parallax = (stage, layers) => {
    if (!motionOK || !fine || !stage) return;
    const s = layers.filter(l => l.el).map(l => ({ d: l.depth,
      x: gsap.quickTo(l.el, 'x', { duration: 1.2, ease: 'power3' }), y: gsap.quickTo(l.el, 'y', { duration: 1.2, ease: 'power3' }) }));
    stage.addEventListener('mousemove', e => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      s.forEach(l => { l.x(nx * l.d); l.y(ny * l.d); });
    });
  };
  addEventListener('load', () => ScrollTrigger.refresh());
})();
