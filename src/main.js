const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.mobile-menu');

function closeMenu() {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menú');
  menu.hidden = true;
  header?.classList.remove('menu-active');
  document.body.classList.remove('menu-open');
  toggle.focus({ preventScroll: true });
}

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.hidden = !open;
    header?.classList.toggle('menu-active', open);
    document.body.classList.toggle('menu-open', open);
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    closeMenu();
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) closeMenu();
  });
  document.addEventListener('click', event => {
    if (!menu.hidden && !header.contains(event.target)) closeMenu();
  });
  matchMedia('(min-width: 801px)').addEventListener('change', event => {
    if (event.matches && !menu.hidden) closeMenu();
  });
}

const updateHeader = () => header?.classList.toggle('is-scrolled', scrollY > 20);
updateHeader();
addEventListener('scroll', updateHeader, { passive: true });

document.getElementById('year')?.replaceChildren(String(new Date().getFullYear()));

const revealed = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -20px 0px', threshold: 0.06 });
  revealed.forEach(element => observer.observe(element));
} else revealed.forEach(element => element.classList.add('is-visible'));

const caseLinks = [...document.querySelectorAll('.case-nav a')];
if (caseLinks.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    caseLinks.forEach(link => link.classList.toggle('is-active', link.hash === `#${visible.target.id}`));
  }, { rootMargin: '-25% 0px -50% 0px', threshold: [0, .2, .5] });
  document.querySelectorAll('.case-section').forEach(section => observer.observe(section));
}
