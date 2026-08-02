import Lenis from '../vendor/lenis.mjs';

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (!prefersReducedMotion) {
  const lenis = new Lenis({

    duration: 1.1,
    easing: (t) => 1 - Math.pow(2, -10 * t),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1,

    syncTouch: false,
    autoRaf: false,
  });

  window.__lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

}
