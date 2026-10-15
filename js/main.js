/* =========================================================
   PORTFOLIO · Marco Roblin Bianchi
   Animaciones e interacción. No hace falta tocar el HTML:
   todo lo que se añade (pantalla de carga, banda de skills,
   cursor, barra de progreso) lo crea este archivo.
   ========================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const navLinks = [...document.querySelectorAll('.nav__links a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const hero = document.querySelector('.hero');
  const heroInner = document.querySelector('.hero__inner');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isDesktop = () => window.innerWidth > 960;

  const escapeHTML = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  if (!reducedMotion) root.classList.add('pre-intro');

  /* ---------- 1. Partir textos en letras y palabras ---------- */
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle && !reducedMotion) {
    let index = 0;
    const lines = [...heroTitle.children];
    heroTitle.setAttribute('aria-label', lines.map((l) => l.textContent.trim()).join(' '));
    lines.forEach((line) => {
      const text = line.textContent.trim();
      line.className = 'line';
      line.removeAttribute('style');
      line.setAttribute('aria-hidden', 'true');
      line.innerHTML = [...text]
        .map((ch) => `<span class="char" style="--i:${index++}">${escapeHTML(ch)}</span>`)
        .join('');
    });
  }

  const heads = [...document.querySelectorAll('.section__head')];
  if (!reducedMotion) {
    heads.forEach((head) => {
      head.classList.remove('reveal');
      head.classList.add('head');
      const h2 = head.querySelector('h2');
      if (!h2) return;
      const text = h2.textContent.trim();
      h2.setAttribute('aria-label', text);
      h2.innerHTML = text
        .split(/\s+/)
        .map((w, i) => `<span class="word-mask" aria-hidden="true"><span class="word" style="--i:${i}">${escapeHTML(w)}</span></span>`)
        .join(' ');
    });
  }

  // Índice de cada etiqueta y punto de lista para que aparezcan uno detrás de otro
  document.querySelectorAll('.tags, .list').forEach((list) => {
    [...list.children].forEach((li, i) => li.style.setProperty('--i', i));
  });
  navLinks.forEach((a, i) => a.style.setProperty('--i', i));

  /* ---------- 2. Banda de skills en movimiento (se crea a partir de tus skills) ---------- */
  let marqueeTrack = null;
  let marqueeGroup = null;
  const skillNames = [...new Set([...document.querySelectorAll('#skills .tags li')].map((li) => li.textContent.trim()))];

  if (hero && skillNames.length) {
    const group = skillNames
      .map((name, i) => `<span class="marquee__item${i % 2 ? ' is-outline' : ''}">${escapeHTML(name)}</span><span class="marquee__sep">✦</span>`)
      .join('');
    const marquee = document.createElement('div');
    marquee.className = 'marquee';
    marquee.setAttribute('aria-hidden', 'true');
    marquee.innerHTML = `<div class="marquee__track"><div class="marquee__group">${group}</div><div class="marquee__group">${group}</div></div>`;
    hero.after(marquee);
    marqueeTrack = marquee.querySelector('.marquee__track');
    marqueeGroup = marquee.querySelector('.marquee__group');
  }

  /* ---------- 3. Barra de progreso de lectura ---------- */
  const progress = document.createElement('div');
  progress.className = 'progress';
  progress.setAttribute('aria-hidden', 'true');
  body.prepend(progress);

  /* ---------- 4. Aparición de elementos al hacer scroll ---------- */
  const heroReveals = hero ? [...hero.querySelectorAll('.reveal')] : [];
  const revealEls = [...document.querySelectorAll('.reveal, .head')].filter((el) => !heroReveals.includes(el));

  const show = (el) => {
    el.classList.add('is-visible');
    const delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
    // "settled": la entrada ya terminó y la tarjeta puede reaccionar al ratón
    setTimeout(() => el.classList.add('settled'), 1100 + delay * 1000);
  };

  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target); // solo se anima una vez
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach(show);
  }

  /* ---------- 5. Pantalla de carga e intro del hero ---------- */
  const startHero = () => {
    root.classList.remove('pre-intro');
    body.classList.add('intro');
    heroReveals.forEach(show);
    setTimeout(() => body.classList.add('intro-done'), 1800);
  };

  if (reducedMotion) {
    root.classList.add('ready');
    startHero();
  } else {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.setAttribute('aria-hidden', 'true');
    loader.innerHTML = `
      <div class="loader__inner">
        <span class="loader__name">Marco Roblin Bianchi — Portfolio</span>
        <span class="loader__count">0</span>
      </div>
      <div class="loader__bar"><i></i></div>`;
    body.prepend(loader);
    root.classList.add('ready');

    const count = loader.querySelector('.loader__count');
    const bar = loader.querySelector('.loader__bar i');
    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      count.textContent = Math.round(eased * 100);
      bar.style.setProperty('--p', eased);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        body.classList.add('loaded');
        setTimeout(startHero, 250);
        setTimeout(() => loader.remove(), 1300);
      }
    };
    requestAnimationFrame(step);
  }

  /* ---------- 6. Scroll suave con Lenis (si no carga, se usa el scroll normal) ---------- */
  let lenis = null;

  if (!reducedMotion) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';
    script.onload = () => {
      if (typeof window.Lenis !== 'function') return;
      lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
      if (body.classList.contains('menu-open')) lenis.stop();
    };
    document.head.appendChild(script);
  }

  // Enlaces internos (#seccion) con desplazamiento suave
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href === '#') { e.preventDefault(); return; } // enlaces de ejemplo aún sin rellenar

    let target = null;
    try { target = document.querySelector(href); } catch (err) { return; }
    if (!target) return;

    e.preventDefault();
    setMenu(false);
    if (lenis) {
      lenis.scrollTo(target, { offset: href === '#inicio' ? 0 : -70, duration: 1.4 });
    } else {
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
    history.replaceState(null, '', href);
  });

  /* ---------- 7. Enlace activo según la sección visible ---------- */
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- 8. Menú móvil ---------- */
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  }

  toggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  window.addEventListener('resize', () => {
    if (isDesktop()) setMenu(false);
  });

  /* ---------- 9. La barra se oculta al hacer scroll y reaparece al parar (escritorio) ---------- */
  let scrollTimer;

  window.addEventListener('scroll', () => {
    if (!isDesktop() || body.classList.contains('menu-open')) return;
    if (window.scrollY > 120) nav.classList.add('is-hidden');
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => nav.classList.remove('is-hidden'), 220);
  }, { passive: true });

  /* ---------- 10. Efectos con el ratón (solo ordenador) ---------- */
  const cursor = { el: null, x: 0, y: 0, tx: 0, ty: 0 };

  if (finePointer && !reducedMotion) {
    // Cursor que sigue al ratón
    cursor.el = document.createElement('div');
    cursor.el.className = 'cursor';
    cursor.el.setAttribute('aria-hidden', 'true');
    cursor.el.innerHTML = '<span class="cursor__ring"></span><span class="cursor__label">Ver</span>';
    body.append(cursor.el);

    window.addEventListener('mousemove', (e) => {
      cursor.tx = e.clientX;
      cursor.ty = e.clientY;
      if (!cursor.el.classList.contains('is-on')) {
        cursor.x = cursor.tx;
        cursor.y = cursor.ty;
        cursor.el.classList.add('is-on');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => cursor.el.classList.remove('is-on'));

    document.addEventListener('mouseover', (e) => {
      const onProject = !!e.target.closest('.project');
      const onLink = !!e.target.closest('a, button, .card, .tags li');
      cursor.el.classList.toggle('is-view', onProject);
      cursor.el.classList.toggle('is-hover', onLink && !onProject);
    });

    // Brillo del hero que sigue al ratón
    if (hero) {
      hero.addEventListener('mousemove', (e) => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        hero.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      });
    }

    // Botones magnéticos
    document.querySelectorAll('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--tx', `${(e.clientX - r.left - r.width / 2) * 0.3}px`);
        btn.style.setProperty('--ty', `${(e.clientY - r.top - r.height / 2) * 0.4}px`);
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.setProperty('--tx', '0px');
        btn.style.setProperty('--ty', '0px');
      });
    });

    // Tarjetas con inclinación 3D y brillo
    document.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty('--gx', `${px * 100}%`);
        card.style.setProperty('--gy', `${py * 100}%`);
        if (!card.classList.contains('settled')) return;
        card.style.setProperty('--rx', `${(0.5 - py) * 6}deg`);
        card.style.setProperty('--ry', `${(px - 0.5) * 6}deg`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- 11. Bucle de animación: scroll suave, parallax, banda y cursor ---------- */
  const parallaxEls = [...document.querySelectorAll('.about__photo, .project__img')];
  let lastY = window.scrollY;
  let velocity = 0;
  let marqueeX = 0;
  let direction = 1;

  const tick = (time) => {
    if (lenis) lenis.raf(time);

    const y = window.scrollY;
    const vh = window.innerHeight;
    velocity += ((y - lastY) - velocity) * 0.1;
    lastY = y;

    // Barra de progreso
    const max = root.scrollHeight - vh;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;

    if (!reducedMotion) {
      // El hero se desplaza más despacio y se desvanece
      if (heroInner && y < vh * 1.3) {
        heroInner.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
        heroInner.style.opacity = Math.max(0, 1 - y / (vh * 0.85)).toFixed(3);
      }

      // Parallax de la foto y las imágenes de proyectos
      parallaxEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.setProperty('--py', `${(p * -40).toFixed(1)}px`);
      });

      // Banda de skills: se acelera y cambia de sentido con el scroll
      if (marqueeTrack && marqueeGroup) {
        if (Math.abs(velocity) > 0.5) direction = velocity > 0 ? 1 : -1;
        marqueeX -= (0.6 + Math.min(Math.abs(velocity) * 0.3, 14)) * direction;
        const width = marqueeGroup.offsetWidth;
        if (width > 0) {
          if (marqueeX <= -width) marqueeX += width;
          if (marqueeX > 0) marqueeX -= width;
        }
        const skew = Math.max(-8, Math.min(8, velocity * -0.25));
        marqueeTrack.style.transform = `translate3d(${marqueeX}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;
      }
    }

    // Cursor con retardo suave
    if (cursor.el) {
      cursor.x += (cursor.tx - cursor.x) * 0.18;
      cursor.y += (cursor.ty - cursor.y) * 0.18;
      cursor.el.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0)`;
    }

    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  /* ---------- 12. Año automático en el pie de página ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
