import { initScrollReveal } from './features/scroll-reveal.js';
import { initSideRays } from './features/side-rays.js';
import { initVariableProximity } from './features/variable-proximity.js';

initScrollReveal('[data-reveal]');

const heroRaysContainer = document.querySelector('#about-hero-rays');

const sideRays = initSideRays(heroRaysContainer, {
  speed: 1.8,
  rayColor1: '#EAB308',
  rayColor2: '#96c8ff',
  intensity: 1.8,
  spread: 1,
  origin: 'top-right',
  tilt: -25,
  saturation: 1.5,
  blend: 0.6,
  falloff: 1,
  opacity: 1,
});

if (sideRays) {
  heroRaysContainer?.classList.add('is-visible');
}

const aboutHero = document.querySelector('.about-hero');
const heroEyebrow = document.querySelector('.about-hero__eyebrow');
const heroTitle = document.querySelector('.about-hero__title');
const heroText = document.querySelector('.about-hero__text');

initVariableProximity(heroEyebrow, {
  containerRef: aboutHero,
  radius: 100,
  falloff: 'gaussian',
  fromWeight: 600,
  toWeight: 900,
});

initVariableProximity(heroTitle, {
  containerRef: aboutHero,
  radius: 140,
  falloff: 'gaussian',
  fromWeight: 650,
  toWeight: 900,
});

initVariableProximity(heroText, {
  containerRef: aboutHero,
  radius: 90,
  falloff: 'gaussian',
  fromWeight: 400,
  toWeight: 700,
});
