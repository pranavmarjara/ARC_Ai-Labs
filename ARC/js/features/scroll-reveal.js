const DEFAULTS = {
  threshold: 0.2,
  rootMargin: '0px 0px -10% 0px',
};

export function initScrollReveal(selector = '[data-reveal]', options = {}) {
  const els = document.querySelectorAll(selector);
  if (!els.length) return null;

  const { threshold, rootMargin } = { ...DEFAULTS, ...options };

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return null;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold, rootMargin });

  els.forEach((el) => observer.observe(el));

  return {
    destroy() {
      observer.disconnect();
    },
  };
}
