import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects, site } from '../src/data/projects.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const rawBase = process.env.SITE_BASE_PATH || '/';
const base = `/${rawBase.split('/').filter(Boolean).join('/')}${rawBase === '/' ? '' : '/'}`;
const origin = (process.env.SITE_URL || site.url || '').replace(/\/$/, '');
const assetVersion = process.env.GITHUB_SHA?.slice(0, 8) || Date.now().toString(36);
const route = (url = '') => `${base}${url.replace(/^\//, '')}`;
const asset = (src) => route(src);
const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const safeUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname ? url.href : null;
  } catch {
    return null;
  }
};

function icon(name, size = 18) {
  const paths = {
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    down: '<path d="M12 4v15m-6-6 6 6 6-6"/>',
    github: '<path d="M9 19c-4 1.3-4-2-6-2m12 4v-3.2a2.8 2.8 0 0 0-.8-2.2c2.7-.3 5.6-1.3 5.6-6A4.7 4.7 0 0 0 18.5 6a4.3 4.3 0 0 0-.1-3s-1 0-3 1.6a10.3 10.3 0 0 0-5.6 0C7.8 3 6.8 3 6.8 3a4.3 4.3 0 0 0-.1 3A4.7 4.7 0 0 0 5.4 9.6c0 4.7 2.9 5.7 5.6 6a2.8 2.8 0 0 0-.8 2.2V21"/>',
    linkedin: '<path d="M4 9v11M4 4v.1M9 20v-11h4v1.5c.7-1.1 1.7-1.7 3.2-1.7 2.5 0 3.8 1.5 3.8 4.4V20h-4v-5.1c0-1.3-.3-2.2-1.5-2.2-1.1 0-1.5.8-1.5 2.2V20z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    whatsapp: '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.4-4.7A8.5 8.5 0 1 1 20.5 11.7Z"/><path d="M8.7 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.8 1.9c.1.3.1.5-.1.7l-.6.8c-.2.2-.2.4-.1.6.5 1 1.3 1.8 2.3 2.4.2.1.4.1.6-.1l.9-1c.2-.2.4-.2.7-.1l1.8.9c.3.1.4.3.4.5v.5c0 .3-.1.6-.4.8-.5.4-1.2.7-2 .7-1.6 0-3.7-1-5.3-2.6S7.1 10 7.3 8.8c.1-.4.3-.7.5-1Z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>',
    code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    spark: '<path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Zm7 14 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="M5 5l14 14M19 5 5 19"/>'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}

const button = (label, href, kind = 'primary', iconName = 'arrow') => href
  ? `<a class="button button--${kind}" href="${esc(href)}"${href.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(label)} ${icon(iconName, 16)}</a>`
  : '';
const buttonRow = (...buttons) => {
  const content = buttons.filter(Boolean).join('');
  return content ? `<div class="button-row">${content}</div>` : '';
};
const projectActions = (project) => buttonRow(
  button('Ver demo', safeUrl(project.demoUrl)),
  button('Ver código en GitHub', safeUrl(project.githubUrl), 'outline', 'github')
);
const tags = (items) => `<ul class="tags" aria-label="Tecnologías">${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
const image = (src, alt, className = '', eager = false) => `<img class="${className}" src="${asset(src)}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>`;
const projectUrl = (project) => route(`projects/${project.slug}/`);

function header(onHome = false) {
  const anchors = ['Inicio', 'Sobre mí', 'Proyectos', 'Contacto'];
  const ids = ['inicio', 'sobre-mi', 'proyectos', 'contacto'];
  const nav = anchors.map((label, i) => `<a href="${onHome ? '#' : `${route()}#`}${ids[i]}"${i === 0 && onHome ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const social = [
    safeUrl(site.links.github) && `<a class="icon-link" href="${esc(site.links.github)}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">${icon('github', 19)}</a>`,
    safeUrl(site.links.linkedin) && `<a class="icon-link" href="${esc(site.links.linkedin)}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">${icon('linkedin', 19)}</a>`
  ].filter(Boolean).join('');
  return `<header class="site-header" id="top"><div class="shell header-inner">
    <a class="brand" href="${route()}" aria-label="Baldovino, ir al inicio"><span class="brand-mark">B<span></span></span><span>Baldovino</span></a>
    <nav class="desktop-nav" aria-label="Navegación principal">${nav}</nav>
    <div class="header-actions">${social}<a class="button button--header" href="${onHome ? '#contacto' : `${route()}#contacto`}">Hablemos ${icon('arrow', 15)}</a></div>
    <div class="header-mobile-actions"><div class="mobile-social">${social}</div><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Abrir menú">${icon('menu', 23)}</button></div>
  </div><nav class="mobile-menu" id="mobile-menu" aria-label="Navegación móvil" hidden>${nav}<a class="mobile-menu__cta" href="${onHome ? '#contacto' : `${route()}#contacto`}">Hablemos ${icon('arrow', 16)}</a></nav></header>`;
}

function footer() {
  const footerLinks = [
    ['GitHub', safeUrl(site.links.github)], ['LinkedIn', safeUrl(site.links.linkedin)]
  ].filter(([, href]) => href).map(([label, href]) => `<a href="${esc(href)}"${href.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`).join('');
  return `<footer class="footer"><div class="shell footer-grid${footerLinks ? '' : ' footer-grid--no-social'}"><div><a class="brand" href="${route()}"><span class="brand-mark">B<span></span></span><span>Baldovino</span></a><p>${esc(site.role)}</p></div><nav aria-label="Navegación del pie"><a href="${route()}#inicio">Inicio</a><a href="${route()}#sobre-mi">Sobre mí</a><a href="${route()}#proyectos">Proyectos</a><a href="${route()}#contacto">Contacto</a></nav>${footerLinks ? `<div class="footer-social">${footerLinks}</div>` : ''}</div><div class="shell footer-bottom"><span>© <span id="year">${new Date().getFullYear()}</span> Baldovino</span></div></footer>`;
}

function page({ title, description, content, currentPath = '', onHome = false, ogImage }) {
  const canonical = origin ? `${origin}${route(currentPath)}` : '';
  const metaUrl = canonical ? `<link rel="canonical" href="${esc(canonical)}"><meta property="og:url" content="${esc(canonical)}">` : '';
  const socialImage = `${origin}${asset(ogImage || projects[0].hero.desktop)}`;
  return `<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#050b19"><meta name="color-scheme" content="dark"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${metaUrl}<meta property="og:type" content="website"><meta property="og:locale" content="es_AR"><meta property="og:site_name" content="Baldovino"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${esc(socialImage)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(socialImage)}"><link rel="icon" type="image/svg+xml" href="${route('favicon.svg')}"><link rel="stylesheet" href="${route('styles.css')}?v=${assetVersion}"><script src="${route('main.js')}?v=${assetVersion}" defer></script></head><body><a class="skip-link" href="#main">Saltar al contenido</a>${header(onHome)}<main id="main">${content}</main>${footer()}</body></html>`;
}

function finalCta(forCase = false) {
  const contactHref = forCase ? `${route()}#contacto` : '#contacto';
  return `<section class="section final-cta${forCase ? ' case-final-cta' : ''}"><div class="shell final-cta__grid"><div class="final-cta__copy reveal"><p class="eyebrow">${forCase ? 'HABLEMOS DE TU IDEA' : 'DISPONIBLE PARA NUEVOS DESAFÍOS'}</p><h2>${forCase ? '¿Querés construir algo así?' : '¿Tenés una idea en mente?'}</h2><p>${forCase ? 'Estoy disponible para conversar sobre proyectos, colaboraciones y oportunidades laborales.' : 'Ya sea un proyecto, una colaboración o una oportunidad laboral, estoy listo para conversar.'}</p>${buttonRow(button('Contactame', contactHref), button('Ver mi LinkedIn', safeUrl(site.links.linkedin), 'outline'))}</div><div class="final-cta__art" aria-hidden="true"><div class="final-cta__orbit"></div><div class="final-cta__planet"><span>&lt;/&gt;</span></div></div></div></section>`;
}

function homeContact() {
  const email = site.links.email && /^mailto:[^\s]+$/i.test(site.links.email) ? site.links.email : null;
  const links = [
    ['Email', 'Enviame un mensaje', email, 'mail'],
    ['WhatsApp', 'Hablemos directamente', safeUrl(site.links.whatsapp), 'whatsapp'],
    ['Instagram', 'Seguime', safeUrl(site.links.instagram), 'instagram']
  ];
  const cards = links.filter(([, , href]) => href).map(([title, description, href, glyph]) =>
    `<a class="contact-cta__link contact-cta__link--${glyph}" href="${esc(href)}"${href.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : ''}><span class="contact-cta__icon" aria-hidden="true">${icon(glyph, 21)}</span><span class="contact-cta__label"><strong>${esc(title)}</strong><small>${esc(description)}</small></span><span class="contact-cta__arrow" aria-hidden="true">${icon('arrow', 18)}</span></a>`
  ).join('');
  return `<section class="section final-cta contact-cta" id="contacto" aria-labelledby="contacto-title"><div class="shell final-cta__grid"><div class="final-cta__copy reveal"><p class="eyebrow">DISPONIBLE PARA NUEVOS DESAFÍOS</p><h2 id="contacto-title">¿Tenés una idea en mente?</h2><p>Ya sea un proyecto, una colaboración o una oportunidad laboral, estoy listo para conversar.</p><div class="contact-cta__links">${cards}</div></div><div class="final-cta__art" aria-hidden="true"><div class="final-cta__orbit"></div><div class="final-cta__planet"><span>&lt;/&gt;</span></div></div></div></section>`;
}

function home() {
  const cards = projects.map(project => {
    const category = project.slug === 'nib-indumentary' ? 'E-Commerce' : project.eyebrow || 'Proyecto';
    const summary = project.slug === 'nib-indumentary'
      ? 'Tienda online de indumentaria con una experiencia completa de compra, pagos y administración.'
      : project.summary;
    return `<article class="project-card project-card--real"><a class="project-card__image" href="${projectUrl(project)}" aria-label="Ver ${esc(project.name)}">${image(project.hero.desktop, `${project.name}: vista principal del proyecto`)}</a><div class="project-card__content"><span class="project-card__category">${esc(category)}</span><h3>${esc(project.name)}</h3><p>${esc(summary)}</p>${tags(project.stack.slice(0, 4))}<div class="project-card__actions">${button('Ver proyecto', projectUrl(project), 'outline')}</div></div></article>`;
  }).join('');
  const capabilities = [
    ['layers', 'Proyectos reales', 'Trabajo aplicado'],
    ['code', 'Tecnologías modernas', 'Stack actual'],
    ['database', 'Soluciones escalables', 'Arquitectura clara'],
    ['spark', 'Enfoque en producto', 'Experiencia útil']
  ];
  const technologies = [
    ['C#', 'C#', 'csharp'], ['.NET', '.NET', 'dotnet'], ['ASP.NET Core', 'ASP', 'aspnet'],
    ['Entity Framework Core', 'EF', 'ef'], ['SQL Server', 'SQL', 'sql'], ['JavaScript', 'JS', 'javascript'],
    ['Bootstrap', 'B5', 'bootstrap'], ['Git', 'Git', 'git'], ['GitHub', icon('github', 31), 'github']
  ];
  const techTiles = technologies.map(([label, mark, name]) => `<li class="tech-tile tech-tile--${name}"><span class="tech-tile__glyph" aria-hidden="true">${name === 'github' ? mark : esc(mark)}</span><span class="tech-tile__label">${esc(label)}</span></li>`).join('');
  const content = `
    <section class="hero atmosphere" id="inicio"><div class="hero-showcase">${image('/assets/nib/nib-showcase.png', 'N|B Indumentary en notebook y celular', 'hero-showcase__image', true)}</div><div class="shell hero-grid"><div class="hero-copy reveal"><p class="eyebrow">DESARROLLADOR FULL STACK .NET</p><h1>Construyendo<br>soluciones<br>web <em>reales.</em></h1><p class="lead">Aplicaciones modernas, escalables y enfocadas en resolver problemas del mundo real.</p>${buttonRow(button('Ver proyectos', '#proyectos'), button('Contactame', '#contacto', 'outline'))}</div></div><div class="shell hero-highlights"><ul>${capabilities.map(([glyph, title, detail]) => `<li class="highlight-item"><span class="highlight-item__icon" aria-hidden="true">${icon(glyph, 21)}</span><span><strong>${esc(title)}</strong><small>${esc(detail)}</small></span></li>`).join('')}</ul></div></section>
    <section class="section projects-section" id="proyectos"><div class="shell"><div class="section-heading"><div><p class="eyebrow">PROYECTOS DESTACADOS</p><h2>Aplicaciones reales, con impacto en el mundo real.</h2></div></div><div class="projects-grid" data-project-count="${projects.length}">${cards}</div></div></section>
    <section class="section about-section" id="sobre-mi"><div class="shell about-grid"><div class="about-copy reveal"><p class="eyebrow">SOBRE MÍ</p><h2>Desarrollo soluciones<br>que generan <em>valor.</em></h2><p>Soy desarrollador Full Stack .NET, con foco en crear soluciones web modernas, funcionales y bien diseñadas.</p><p>Me interesa transformar ideas en productos reales que las personas puedan usar y que realmente funcionen.</p></div><ul class="tech-stack reveal" aria-label="Tecnologías utilizadas">${techTiles}</ul></div></section>
    ${homeContact()}`;
  return page({ title: `${site.name} | Full Stack .NET Developer`, description: site.description, content, onHome: true });
}

function caseMedia(section) {
  if (!section.media.length) return '';
  const desktop = section.media.find(media => media.type === 'desktop');
  const mobile = section.media.find(media => media.type === 'mobile');
  return `<div class="case-media ${mobile && desktop ? 'case-media--duo' : mobile ? 'case-media--phone-only' : ''}">${desktop ? `<div class="case-screen">${image(desktop.src, desktop.alt)}</div>` : ''}${mobile ? `<div class="case-phone"><div class="case-phone__notch"></div>${image(mobile.src, mobile.alt)}</div>` : ''}</div>`;
}

function caseStudy(project) {
  const isNib = project.slug === 'nib-indumentary';
  const caseTitle = isNib ? '<span>N|B</span><span>Indumentary</span>' : esc(project.name);
  const heroBadges = project.heroStack
    ? `<ul class="case-hero-badges" aria-label="Tecnologías principales">${project.heroStack.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`
    : tags(project.stack);
  const heroDescription = isNib
    ? 'E-commerce de indumentaria desarrollado con ASP.NET Core MVC, con una experiencia completa de compra y gestión.'
    : project.summary;
  const heroActions = buttonRow(
    button('Ver proyecto', '#paso-01'),
    button('Ver código', safeUrl(project.githubUrl), 'outline', 'github')
  );
  const heroVisual = isNib ? '/assets/nib/nib-showcase.png' : project.hero.desktop;
  const heroAlt = isNib ? 'N|B Indumentary en notebook y celular' : `${project.name}: vista principal`;
  const content = `
    <section class="case-hero atmosphere"><div class="case-showcase">${image(heroVisual, heroAlt, 'hero-showcase__image', true)}</div><div class="shell case-hero-grid"><div class="case-hero-copy"><a class="back-link" href="${route()}#proyectos">← Volver a proyectos</a><p class="eyebrow">${isNib ? 'E-COMMERCE DE INDUMENTARIA' : esc(project.eyebrow || 'PROYECTO')}</p><h1>${caseTitle}</h1><p class="lead">${esc(heroDescription)}</p>${heroBadges}${heroActions}</div></div></section>
    <nav class="case-nav" aria-label="Etapas del proyecto"><div class="shell case-nav__inner">${project.sections.map(section => `<a href="#paso-${section.number}"><span>${section.number}</span>${esc(section.label)}</a>`).join('')}</div></nav>
    ${project.sections.map((section, index) => `<section class="case-section ${index % 2 ? 'case-section--reverse' : ''} ${!section.media.length ? 'case-section--closing' : ''}" id="paso-${section.number}"><div class="shell case-grid"><div class="case-copy reveal"><span class="case-number">${section.number}</span><p class="eyebrow">${esc(section.label)}</p><h2>${esc(section.title)}</h2><p>${esc(section.description)}</p>${index === project.sections.length - 1 ? `${tags(project.stack)}${projectActions(project)}` : ''}</div>${caseMedia(section)}</div></section>`).join('')}
    ${finalCta(true)}`;
  return page({ title: `${project.name} | Caso de estudio · Baldovino`, description: project.summary, content, currentPath: `projects/${project.slug}/`, ogImage: project.hero.desktop });
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, 'public'), dist, { recursive: true });
await writeFile(path.join(dist, 'styles.css'), await readFile(path.join(root, 'src/styles.css')));
await writeFile(path.join(dist, 'main.js'), await readFile(path.join(root, 'src/main.js')));
await writeFile(path.join(dist, 'index.html'), home());
for (const project of projects) {
  const folder = path.join(dist, 'projects', project.slug);
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(folder, 'index.html'), caseStudy(project));
}
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin}${route('sitemap.xml')}\n` : ''}`);
if (origin) {
  const urls = [route(), ...projects.map(project => projectUrl(project))];
  await writeFile(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="utf-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${esc(`${origin}${url}`)}</loc></url>`).join('')}</urlset>`);
}
console.log(`Built ${projects.length + 1} pages in dist/ (base: ${base})`);
