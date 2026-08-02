const FROM_COLOR = [10, 10, 10];
const TO_COLOR = [255, 255, 255];

const BAND = 0.12;

const DURATION_MULTIPLIER = 5 / 3;

function wrapWords(root) {
  const textNodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) textNodes.push(node);

  textNodes.forEach((textNode) => {
    const segments = textNode.textContent.split(/(\s+)/);
    const frag = document.createDocumentFragment();

    segments.forEach((segment) => {
      if (segment === '') return;
      if (/^\s+$/.test(segment)) {
        frag.appendChild(document.createTextNode(segment));
      } else {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = segment;
        frag.appendChild(span);
      }
    });

    textNode.parentNode.replaceChild(frag, textNode);
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function initMissionReveal(selector = '.mission__text') {
  const el = document.querySelector(selector);
  if (!el) return null;

  wrapWords(el);
  const words = el.querySelectorAll('.word');
  const count = words.length;
  if (!count) return null;

  let ticking = false;

  function update() {
    ticking = false;

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;

    const baseStart = vh - vh * 0.3;
    const endAnchor = Math.min(vh - rect.height, baseStart - 1);
    const start = endAnchor + DURATION_MULTIPLIER * (baseStart - endAnchor);

    const range = start - endAnchor;
    const EXTRA_FINISH_SCROLLS = 1;
    const end = endAnchor - (range / 3) * EXTRA_FINISH_SCROLLS;

    const progress = clamp((start - rect.top) / (start - end), 0, 1);

    words.forEach((word, i) => {
      const threshold = count > 1 ? (i / (count - 1)) * (1 - BAND) : 0;
      const local = clamp((progress - threshold) / BAND, 0, 1);

      const r = Math.round(FROM_COLOR[0] + (TO_COLOR[0] - FROM_COLOR[0]) * local);
      const g = Math.round(FROM_COLOR[1] + (TO_COLOR[1] - FROM_COLOR[1]) * local);
      const b = Math.round(FROM_COLOR[2] + (TO_COLOR[2] - FROM_COLOR[2]) * local);
      word.style.color = `rgb(${r}, ${g}, ${b})`;
    });
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  return {
    destroy() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    },
  };
}
