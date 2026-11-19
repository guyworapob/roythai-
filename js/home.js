/* Home page animation. Everything is skipped when the user prefers reduced motion
   (CSS then shows a plain static layout). */
(() => {
  const { motionOK } = window.RT;
  const $ = s => document.querySelector(s);
  if (!motionOK) return;

  /* Mouse parallax in the hero: each layer travels a different distance for depth */
  RT.parallax($('.hero'), [
    { el: $('.hero .bw'), depth: -36 }, { el: $('.glow.gold'), depth: 90 },
    { el: $('.glow.red'), depth: -70 }, { el: $('.hero-title'), depth: 28 } ]);

  /* Opening sequence — plays when the page curtain lifts */
  const intro = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });
  intro.from('.hero-title .ln>span', { yPercent: 115, duration: 1.3, stagger: 0.14 }, 0)
       .from('.hero .bi', { yPercent: 16, opacity: 0, scale: 0.9, duration: 1.8 }, 0.15)
       .from('.glow', { opacity: 0, scale: 0.6, duration: 2.2 }, 0)
       .from('.site-header', { y: -40, opacity: 0, duration: 1.1 }, 0.5)
       .from('.hero-cta,.scroll-hint', { opacity: 0, y: 30, duration: 1 }, 1);
  RT.ready.then(() => intro.play());

  /* SCROLL EXPERIENCE — hero is pinned for 220% of a screen and scrubbed:
     title fades, bg black -> dark red, bottle grows and drifts right,
     new copy slides in from the left and the note from the right. */
  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width:861px)', mob: '(max-width:860px)' }, ctx => {
    const desk = ctx.conditions.desk;
    gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=220%', pin: true, scrub: 1, anticipatePin: 1, refreshPriority: 2 } })
      .to('.hero-title', { opacity: 0, scale: 0.92, duration: 0.6 }, 0)
      .to('.hero', { backgroundColor: '#6D1015', duration: 1 }, 0)
      .to('.glow.gold', { opacity: 0.35, scale: 1.4, duration: 1 }, 0)
      .to('.glow.red', { opacity: 1, scale: 1.3, duration: 1 }, 0)
      .to('.hero .bottle', { scale: desk ? 1.28 : 1.02, xPercent: desk ? 62 : 0, yPercent: desk ? 0 : -8, rotate: desk ? -5 : 0, duration: 1, ease: 'none' }, 0)
      .to('.scroll-hint,.hero-cta', { opacity: 0, duration: 0.2 }, 0)
      .fromTo('.sc .ln>span', { xPercent: -115 }, { xPercent: 0, stagger: 0.12, duration: 0.6, ease: 'power3.out' }, 0.35)
      .fromTo('.sc-note', { x: 140, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 }, 0.6)
      .to({}, { duration: 0.5 });                              // hold the final frame briefly
  });

  /* Story image: clip-path wipe + inner scale (image scale animation) + slow drift */
  gsap.from('.story .frame', { clipPath: 'inset(100% 0 0 0)', duration: 1.5, ease: 'power4.out', scrollTrigger: { trigger: '.story .frame', start: 'top 85%' } });
  gsap.fromTo('.story .crop', { scale: 1.4 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.story .frame', start: 'top bottom', end: 'bottom 30%', scrub: true } });
  gsap.to('.story .frame', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.story', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* HORIZONTAL SCROLL — pin the section and translate the track leftwards.
     Elements marked data-hpar move at a different speed (parallax inside the track). */
  const track = $('.h-track'), bar = $('.h-progress i');
  const dist = () => track.scrollWidth - innerWidth;
  const hTween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: {
    trigger: '.h-wrap', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1,
    onUpdate: self => (bar.style.transform = `scaleX(${self.progress})`) } });
  gsap.utils.toArray('[data-hpar]').forEach(el => {
    const d = +el.dataset.hpar;
    gsap.fromTo(el, { x: d }, { x: -d, ease: 'none', scrollTrigger: { trigger: el.closest('.panel'), containerAnimation: hTween, start: 'left right', end: 'right left', scrub: true } });
  });
})();
