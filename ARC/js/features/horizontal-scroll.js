const MOBILE_QUERY = '(max-width: 720px)';

function initHorizontalScrollTrack(section) {
  const track = section.querySelector('#colcards');
  if (!track) return;

  let scrollDistance = 0;
  let maxTranslate = 0;

  function isMobile() {
    return window.matchMedia(MOBILE_QUERY).matches;
  }

  function reset() {
    section.style.height = '';
    track.style.transform = '';
  }

  function measure() {
    if (isMobile()) return;
    const trackStyles = getComputedStyle(track);
    const leftGap = parseFloat(trackStyles.marginLeft) || 0;
    const overflow = track.scrollWidth - window.innerWidth + leftGap * 2;

    maxTranslate = Math.max(overflow, 0);
    scrollDistance = maxTranslate;

    section.style.height = `calc(100vh + ${scrollDistance}px)`;
  }

  function update() {
    if (isMobile()) return;

    const rect = section.getBoundingClientRect();

    const raw = -rect.top / (scrollDistance || 1);
    const progress = Math.min(Math.max(raw, 0), 1);

    track.style.transform = `translate3d(${-progress * maxTranslate}px, 0, 0)`;
  }

  let ticking = false;
  function onScroll() {
    if (isMobile()) return;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    }
  }

  function onResize() {
    if (isMobile()) {
      reset();
      return;
    }
    measure();
    update();
  }

  if (isMobile()) {
    reset();
  } else {
    measure();
    update();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
}

function init() {
  document.querySelectorAll('.collaborators').forEach(initHorizontalScrollTrack);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
