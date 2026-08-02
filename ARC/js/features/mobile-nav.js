const MOBILE_QUERY = '(max-width: 720px)';

const header = document.querySelector('#site-header');
const toggle = document.querySelector('#nav-toggle');

function isMobile() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function closeNav() {
  if (!header) return;
  header.classList.remove('site-header--nav-open');
  toggle?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
  window.__lenis?.start();
}

function openNav() {
  if (!header) return;
  header.classList.add('site-header--nav-open');
  toggle?.setAttribute('aria-expanded', 'true');
  document.body.classList.add('nav-open');
  window.__lenis?.stop();
}

toggle?.addEventListener('click', () => {
  const isOpen = header.classList.contains('site-header--nav-open');
  if (isOpen) {
    closeNav();
  } else {
    openNav();
  }
});

header
  ?.querySelectorAll('.site-header__nav a, .site-header__actions a')
  .forEach(link => link.addEventListener('click', () => closeNav()));

document.addEventListener('click', e => {
  if (!header?.classList.contains('site-header--nav-open')) return;
  if (header.contains(e.target)) return;
  closeNav();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNav();
});

window.matchMedia(MOBILE_QUERY).addEventListener('change', e => {
  if (!e.matches) closeNav();
});

document.querySelectorAll('.nav-dropdown').forEach(item => {
  const caret = item.querySelector('.nav-dropdown__caret');
  if (!caret) return;

  caret.setAttribute('role', 'button');
  caret.setAttribute('tabindex', '0');
  caret.setAttribute('aria-expanded', 'false');
  caret.setAttribute('aria-label', 'Toggle submenu');

  function toggleSubmenu() {
    const isOpen = item.classList.toggle('nav-dropdown--open');
    caret.setAttribute('aria-expanded', String(isOpen));

    document.querySelectorAll('.nav-dropdown--open').forEach(other => {
      if (other === item) return;
      other.classList.remove('nav-dropdown--open');
      other.querySelector('.nav-dropdown__caret')?.setAttribute('aria-expanded', 'false');
    });
  }

  caret.addEventListener('click', e => {
    if (!isMobile()) return;
    e.preventDefault();
    e.stopPropagation();
    toggleSubmenu();
  });

  caret.addEventListener('keydown', e => {
    if (!isMobile()) return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    toggleSubmenu();
  });
});
