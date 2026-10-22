import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects, site } from '../src/data/projects.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const rawBase = process.env.SITE_BASE_PATH || '/';
const base = `/${rawBase.split('/').filter(Boolean).join('/')}${rawBase === '/' ? '' : '/'}`;
const origin = (process.env.SITE_URL || site.url || '').replace(/\/$/, '');
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
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Abrir menú">${icon('menu', 23)}</button>
  </div><nav class="mobile-menu" id="mobile-menu" aria-label="Navegación móvil" hidden>${nav}<a class="mobile-menu__cta" href="${onHome ? '#contacto' : `${route()}#contacto`}">Hablemos ${icon('arrow', 16)}</a></nav></header>`;
}

function footer() {
  const footerLinks = [
    ['GitHub', safeUrl(site.links.github)], ['LinkedIn', safeUrl(site.links.linkedin)],
    ['Email', site.links.email && /^mailto:[^\s]+$/i.test(site.links.email) ? site.links.email : null]
  ].filter(([, href]) => href).map(([label, href]) => `<a href="${esc(href)}"${href.startsWith('https://') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`).join('');
  return `<footer class="footer"><div class="shell footer-grid${footerLinks ? '' : ' footer-grid--no-social'}"><div><a class="brand" href="${route()}"><span class="brand-mark">B<span></span></span><span>Baldovino</span></a><p>${esc(site.role)}</p></div><nav aria-label="Navegación del pie"><a href="${route()}#inicio">Inicio</a><a href="${route()}#sobre-mi">Sobre mí</a><a href="${route()}#proyectos">Proyectos</a><a href="${route()}#contacto">Contacto</a></nav>${footerLinks ? `<div class="footer-social">${footerLinks}</div>` : ''}</div><div class="shell footer-bottom"><span>© <span id="year">${new Date().getFullYear()}</span> Baldovino</span><span>Diseñado y desarrollado con foco en producto.</span></div></footer>`;
}

function page({ title, description, content, currentPath = '', onHome = false, ogImage }) {
  const canonical = origin ? `${origin}${route(currentPath)}` : '';
  const metaUrl = canonical ? `<link rel="canonical" href="${esc(canonical)}"><meta property="og:url" content="${esc(canonical)}">` : '';
  const socialImage = `${origin}${asset(ogImage || projects[0].hero.desktop)}`;
  return `<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#050b19"><meta name="color-scheme" content="dark"><title>${esc(title)}</title><meta name="description" content="${esc(description)}">${metaUrl}<meta property="og:type" content="website"><meta property="og:locale" content="es_AR"><meta property="og:site_name" content="Baldovino"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${esc(socialImage)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(description)}"><meta name="twitter:image" content="${esc(socialImage)}"><link rel="icon" type="image/svg+xml" href="${route('favicon.svg')}"><link rel="stylesheet" href="${route('styles.css')}"><script src="${route('main.js')}" defer></script></head><body><a class="skip-link" href="#main">Saltar al contenido</a>${header(onHome)}<main id="main">${content}</main>${footer()}</body></html>`;
}

function deviceComposition(project, className = '') {
  return `<div class="device-composition ${className}" aria-label="Vistas de N|B Indumentary en escritorio y móvil"><div class="orbit orbit--one"></div><div class="orbit orbit--two"></div><div class="laptop"><div class="laptop__screen">${image(project.hero.desktop, 'Inicio de N|B Indumentary en escritorio', '', true)}</div><div class="laptop__base"></div></div><div class="phone"><div class="phone__notch"></div>${image(project.hero.mobile, 'Inicio de N|B Indumentary en móvil')}</div></div>`;
}

function home() {
  const featured = projects.find(project => project.featured) || projects[0];
  const cards = projects.map(project => `<article class="project-card project-card--real"><div class="project-card__image">${image(project.hero.desktop, `${project.name}: vista principal del proyecto`)}</div><div class="project-card__content"><div class="card-top">${project.mark ? `<span class="nib-wordmark">${esc(project.mark)}${project.markCaption ? `<small>${esc(project.markCaption)}</small>` : ''}</span>` : ''}${project.featured ? '<span class="badge">Proyecto destacado</span>' : ''}</div><h3>${esc(project.name)}</h3><p>${esc(project.summary)}</p>${tags(project.stack.slice(0, 4))}<a class="button button--primary" href="${projectUrl(project)}">Ver proyecto ${icon('arrow', 16)}</a></div></article>`).join('');
  const capabilities = [
    ['code', '.NET', 'Desarrollo Web'], ['database', 'Bases de datos', 'Diseño y optimización'],
    ['layers', 'Interfaces modernas', 'Enfoque en UX/UI'], ['spark', 'Soluciones reales', 'Desde la idea al producto']
  ];
  const steps = featured.sections.slice(1, 10).map(section => `<a href="${projectUrl(featured)}#paso-${section.number}" class="journey-step"><strong>${section.number}</strong><span>${esc(section.label)}</span></a>`).join('');
  const content = `
    <section class="hero atmosphere" id="inicio"><div class="stars" aria-hidden="true"></div><div class="planet" aria-hidden="true"></div><div class="shell hero-grid"><div class="hero-copy reveal"><p class="eyebrow">DESARROLLADOR FULL STACK .NET</p><h1>Construyendo<br>soluciones web<br><em>reales.</em></h1><p class="lead">Aplicaciones modernas, escalables y enfocadas en resolver problemas del mundo real.</p><div class="button-row">${button('Ver proyectos', '#proyectos', 'primary', 'down')}${button('Sobre mí', '#sobre-mi', 'outline')}</div></div><div class="hero-visual reveal">${deviceComposition(featured)}</div></div><div class="hero-horizon" aria-hidden="true"></div></section>
    <section class="section projects-section" id="proyectos"><div class="shell"><div class="section-heading"><div><p class="eyebrow">PROYECTOS</p><h2>Proyectos que<br>convierten ideas en <em>realidades</em></h2><p>Aplicaciones web pensadas para ser funcionales, escalables y con una experiencia de usuario de alto nivel.</p></div><a class="text-link" href="${projectUrl(featured)}">Explorar el proyecto ${icon('arrow', 17)}</a></div><div class="projects-grid" data-project-count="${projects.length}">${cards}</div></div></section>
    <section class="section about-section" id="sobre-mi"><div class="shell about-grid"><div class="about-copy reveal"><p class="eyebrow">SOBRE MÍ</p><h2>Desarrollo aplicaciones<br>que generan <em>valor.</em></h2><p>Soy desarrollador Full Stack .NET, con foco en crear soluciones web modernas, funcionales y bien diseñadas.</p><p>Me interesa transformar ideas en productos reales que las personas puedan usar y que realmente funcionen.</p></div><div class="tech-illustration reveal" aria-hidden="true"><div class="tech-glow"></div><div class="server server--one"></div><div class="server server--two"></div><div class="code-panel"><div class="code-panel__bar"><i></i><i></i><i></i><span>solution.cs</span></div><div class="code-lines"><b>public class Solution</b><span>{</span><i>  var idea = new Product();</i><i>  idea.Design();</i><i>  idea.Build();</i><i>  idea.Ship();</i><span>}</span></div></div><div class="tech-platform"></div></div><ul class="capabilities">${capabilities.map(([glyph, title, detail]) => `<li><span class="cap-icon">${icon(glyph, 20)}</span><span><strong>${esc(title)}</strong><small>${esc(detail)}</small></span></li>`).join('')}</ul></div></section>
    <section class="section featured-section" id="destacado"><div class="shell featured-grid"><div class="featured-copy reveal"><p class="eyebrow">PROYECTO DESTACADO</p><h2>${esc(featured.name)}</h2><p class="featured-lead">${esc(featured.summary)}</p><p>${esc(featured.description)}</p><div class="button-row">${button('Ver proyecto', projectUrl(featured))}${button('Ver código', safeUrl(featured.githubUrl), 'outline', 'github')}</div>${tags(featured.stack.slice(0, 6))}</div><div class="featured-visual reveal">${deviceComposition(featured, 'device-composition--featured')}</div></div></section>
    <section class="section journey-section"><div class="shell"><p class="eyebrow">DE LA IDEA A LA OPERACIÓN</p><div class="journey-head"><h2>Un recorrido completo</h2><p>Desde descubrir un producto hasta administrarlo, todo en una misma plataforma.</p></div><div class="journey-steps">${steps}</div><div class="journey-preview"><div><span class="journey-index">01 <span>Inicio</span></span><h3>Moda urbana, en cualquier pantalla</h3><p>Una experiencia visual moderna y responsive que transmite la identidad de la marca desde el primer momento.</p><a class="button button--outline" href="${projectUrl(featured)}">Ver el caso completo ${icon('arrow', 16)}</a></div><div class="journey-preview__screen">${image(featured.hero.desktop, 'Portada de N|B Indumentary en escritorio')}</div></div></div></section>
    <section class="section contact-section" id="contacto"><div class="shell"><div class="contact-card"><div class="contact-light" aria-hidden="true"></div><p class="eyebrow">CONTACTO</p><h2>Construyamos algo<br><em>que genere valor.</em></h2><p>Si querés conversar sobre un proyecto, este espacio está listo para conectarnos.</p>${site.links.email ? button('Hablemos', site.links.email) : ''}</div></div></section>`;
  return page({ title: `${site.name} | Full Stack .NET Developer`, description: site.description, content, onHome: true });
}

function caseMedia(section) {
  if (!section.media.length) return '';
  const desktop = section.media.find(media => media.type === 'desktop');
  const mobile = section.media.find(media => media.type === 'mobile');
  return `<div class="case-media ${mobile && desktop ? 'case-media--duo' : mobile ? 'case-media--phone-only' : ''}">${desktop ? `<div class="case-screen">${image(desktop.src, desktop.alt)}</div>` : ''}${mobile ? `<div class="case-phone"><div class="case-phone__notch"></div>${image(mobile.src, mobile.alt)}</div>` : ''}</div>`;
}

function caseStudy(project) {
  const content = `<section class="case-hero atmosphere"><div class="stars" aria-hidden="true"></div><div class="shell case-hero-grid"><div><a class="back-link" href="${route()}#proyectos">← Volver a proyectos</a><p class="eyebrow">CASE STUDY · FULL STACK .NET</p><h1>${esc(project.name)}</h1><p class="lead">${esc(project.summary)}</p><p>${esc(project.description)}</p>${tags(project.stack)}${projectActions(project)}</div><div class="case-hero-screen">${image(project.hero.desktop, `${project.name}, vista principal en escritorio`, '', true)}</div></div></section><nav class="case-nav" aria-label="Etapas del proyecto"><div class="shell case-nav__inner">${project.sections.map(section => `<a href="#paso-${section.number}"><span>${section.number}</span>${esc(section.label)}</a>`).join('')}</div></nav>${project.sections.map((section, index) => `<section class="case-section ${index % 2 ? 'case-section--reverse' : ''} ${!section.media.length ? 'case-section--closing' : ''}" id="paso-${section.number}"><div class="shell case-grid"><div class="case-copy reveal"><span class="case-number">${section.number}</span><p class="eyebrow">${esc(section.label)}</p><h2>${esc(section.title)}</h2><p>${esc(section.description)}</p>${index === project.sections.length - 1 ? `${tags(project.stack)}${projectActions(project)}` : ''}</div>${caseMedia(section)}</div></section>`).join('')}`;
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
