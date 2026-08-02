import { initScrollReveal } from './features/scroll-reveal.js';
import { initColorBends } from './features/hero-colorbends.js';
import { initMissionReveal } from './features/mission-reveal.js';

initScrollReveal('[data-reveal]');

initMissionReveal('.mission__text');

const heroBgContainer = document.querySelector('#hero-bg');

const colorBends = initColorBends(heroBgContainer, {
  colors: ['#38383d'],
  rotation: -180,
  speed: 0.15,
  scale: 1.2,
  frequency: 1,
  warpStrength: 1,
  mouseInfluence: 0,
  parallax: 0,
  noise: 0.15,
  iterations: 1,
  intensity: 1.5,
  bandWidth: 6,
  transparent: true,
  autoRotate: 0,
});

if (colorBends) {
  heroBgContainer?.classList.add('is-visible');
}

const headerBlur = document.querySelector('.header-blur');
if (headerBlur) {
  const updateHeaderBlur = () => {
    const overHero = window.scrollY < window.innerHeight;
    headerBlur.classList.toggle('header-blur--hidden', overHero);
  };
  updateHeaderBlur();
  window.addEventListener('scroll', updateHeaderBlur, { passive: true });
  window.addEventListener('resize', updateHeaderBlur);
}
