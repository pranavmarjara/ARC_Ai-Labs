function wrapTextForProximity(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeValue.length > 0) textNodes.push(node);
  }

  textNodes.forEach(textNode => {
    const frag = document.createDocumentFragment();
    const words = textNode.nodeValue.split(' ');

    words.forEach((word, wi) => {
      if (word.length > 0) {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'variable-proximity__word';
        for (const letter of word) {
          const letterSpan = document.createElement('span');
          letterSpan.className = 'variable-proximity__letter';
          letterSpan.textContent = letter;
          wordSpan.appendChild(letterSpan);
        }
        frag.appendChild(wordSpan);
      }
      if (wi < words.length - 1) {
        const spaceSpan = document.createElement('span');
        spaceSpan.className = 'variable-proximity__word';
        spaceSpan.innerHTML = '&nbsp;';
        frag.appendChild(spaceSpan);
      }
    });

    textNode.parentNode.replaceChild(frag, textNode);
  });

  return Array.from(root.querySelectorAll('.variable-proximity__letter'));
}

function calculateFalloff(distance, radius, falloff) {
  const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
  switch (falloff) {
    case 'exponential':
      return norm ** 2;
    case 'gaussian':
      return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
    case 'linear':
    default:
      return norm;
  }
}

function lockLetterWidths(letters) {
  letters.forEach(letter => {
    const width = letter.getBoundingClientRect().width;
    letter.style.width = `${width}px`;
  });
}

export function initVariableProximity(root, options = {}) {
  if (!root) return null;

  const {
    containerRef = root,
    radius = 100,
    falloff = 'linear',
    fromWeight = 400,
    toWeight = 900,
  } = options;

  const originalText = root.textContent;

  const visual = document.createElement('span');
  visual.className = 'variable-proximity';
  visual.setAttribute('aria-hidden', 'true');
  while (root.firstChild) visual.appendChild(root.firstChild);
  root.appendChild(visual);

  const srText = document.createElement('span');
  srText.className = 'sr-only';
  srText.textContent = originalText;
  root.appendChild(srText);

  const letters = wrapTextForProximity(visual);
  lockLetterWidths(letters);

  let mouse = { x: -99999, y: -99999 };
  let lastMouse = { x: null, y: null };

  const updateMouse = (clientX, clientY) => {
    const rect = containerRef.getBoundingClientRect();
    mouse = { x: clientX - rect.left, y: clientY - rect.top };
  };
  const onMouseMove = e => updateMouse(e.clientX, e.clientY);
  const onTouchMove = e => {
    const touch = e.touches[0];
    if (touch) updateMouse(touch.clientX, touch.clientY);
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('touchmove', onTouchMove, { passive: true });

  let raf = 0;

  const loop = () => {
    if (mouse.x !== lastMouse.x || mouse.y !== lastMouse.y) {
      lastMouse = { x: mouse.x, y: mouse.y };
      const containerRect = containerRef.getBoundingClientRect();

      letters.forEach(letter => {
        const rect = letter.getBoundingClientRect();
        const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
        const letterCenterY = rect.top + rect.height / 2 - containerRect.top;
        const dx = mouse.x - letterCenterX;
        const dy = mouse.y - letterCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= radius) {
          letter.style.fontVariationSettings = `'wght' ${fromWeight}`;
          return;
        }

        const t = calculateFalloff(distance, radius, falloff);
        const weight = fromWeight + (toWeight - fromWeight) * t;
        letter.style.fontVariationSettings = `'wght' ${weight}`;
      });
    }
    raf = requestAnimationFrame(loop);
  };

  raf = requestAnimationFrame(loop);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    },
  };
}
