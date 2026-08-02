const toTopBtn = document.querySelector('#footer-to-top');

toTopBtn?.addEventListener('click', () => {
  if (window.__lenis) {
    window.__lenis.scrollTo(0);
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

function initEmailCopy(selector, copiedClass) {
  const el = document.querySelector(selector);
  if (!el) return;

  const originalText = el.textContent;
  const address = originalText.trim();
  let resetTimer = null;

  el.addEventListener('click', e => {
    if (!navigator.clipboard) return;

    e.preventDefault();

    navigator.clipboard.writeText(address).then(() => {
      el.textContent = 'Copied to clipboard';
      el.classList.add(copiedClass);

      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        el.textContent = originalText;
        el.classList.remove(copiedClass);
      }, 1800);
    });
  });
}

initEmailCopy('.footer__email', 'footer__email--copied');
initEmailCopy('.join-contact__email', 'join-contact__email--copied');
