(function () {
  const THUMB_HEIGHT = 45;

  function init() {
    const track = document.createElement('div');
    track.className = 'scroll-progress';
    track.setAttribute('aria-hidden', 'true');

    const thumb = document.createElement('div');
    thumb.className = 'scroll-progress__thumb';
    track.appendChild(thumb);

    document.body.appendChild(track);

    let ticking = false;
    let dragging = false;
    let dragStartY = 0;
    let dragStartScrollTop = 0;
    let dragTicking = false;
    let pendingClientY = 0;
    let previousScrollBehavior = '';

    function getMetrics() {
      const doc = document.documentElement;
      const trackHeight = track.clientHeight;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const thumbHeight = THUMB_HEIGHT;
      const maxThumbTop = trackHeight - thumbHeight;
      return { doc, trackHeight, scrollable, thumbHeight, maxThumbTop };
    }

    function update() {
      ticking = false;

      const { doc, scrollable, thumbHeight, maxThumbTop } = getMetrics();

      if (scrollable <= 0) {
        track.style.display = 'none';
        return;
      }
      track.style.display = '';

      const progress = doc.scrollTop / scrollable;

      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${progress * maxThumbTop}px)`;
    }

    function onScroll() {
      if (dragging) return;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    function onPointerDown(e) {
      const { scrollable } = getMetrics();
      if (scrollable <= 0) return;

      dragging = true;
      dragStartY = e.clientY;
      dragStartScrollTop = document.documentElement.scrollTop;
      track.classList.add('is-dragging');
      thumb.setPointerCapture(e.pointerId);

      previousScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';

      e.preventDefault();
    }

    function applyDragScroll() {
      dragTicking = false;
      if (!dragging) return;

      const { scrollable, maxThumbTop } = getMetrics();
      if (maxThumbTop <= 0 || scrollable <= 0) return;

      const deltaY = pendingClientY - dragStartY;
      const scrollDelta = (deltaY / maxThumbTop) * scrollable;
      const newScrollTop = Math.min(
        Math.max(dragStartScrollTop + scrollDelta, 0),
        scrollable
      );

      if (window.__lenis) {
        window.__lenis.scrollTo(newScrollTop, { immediate: true });
      } else {
        window.scrollTo(window.scrollX, newScrollTop);
      }
      update();
    }

    function onPointerMove(e) {
      if (!dragging) return;

      pendingClientY = e.clientY;
      if (!dragTicking) {
        dragTicking = true;
        requestAnimationFrame(applyDragScroll);
      }
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-dragging');
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
      if (thumb.hasPointerCapture(e.pointerId)) {
        thumb.releasePointerCapture(e.pointerId);
      }
    }

    thumb.addEventListener('pointerdown', onPointerDown);
    thumb.addEventListener('pointermove', onPointerMove);
    thumb.addEventListener('pointerup', onPointerUp);
    thumb.addEventListener('pointercancel', onPointerUp);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
