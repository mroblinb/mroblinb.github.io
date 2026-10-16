/* =========================================================
   PORTFOLIO · Marco Roblin Bianchi
   Animaciones e interacción. No hace falta tocar el HTML:
   todo lo que se añade (pantalla de carga, banda de skills,
   menú flotante, barra de progreso) lo crea este archivo.
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

  // Títulos de sección: palabras sueltas + número gigante de fondo
  const heads = [...document.querySelectorAll('.section__head')];
  if (!reducedMotion) {
    heads.forEach((head) => {
      head.classList.remove('reveal');
      head.classList.add('head');
      const h2 = head.querySelector('h2');
      if (h2) {
        const text = h2.textContent.trim();
        h2.setAttribute('aria-label', text);
        h2.innerHTML = text
          .split(/\s+/)
          .map((w, i) => `<span class="word-mask" aria-hidden="true"><span class="word" style="--i:${i}">${escapeHTML(w)}</span></span>`)
          .join(' ');
      }
      const num = head.querySelector('.section__num');
      if (num) {
        const ghost = document.createElement('span');
        ghost.className = 'head__ghost';
        ghost.setAttribute('aria-hidden', 'true');
        ghost.dataset.speed = '120';
        ghost.textContent = num.textContent.trim();
        head.append(ghost);
      }
    });
  }

  // Índices para que los elementos aparezcan uno detrás de otro
  const setIndex = (els) => els.forEach((el, i) => el.style.setProperty('--i', i));
  document.querySelectorAll('.tags, .list, .contact__list').forEach((list) => setIndex([...list.children]));
  setIndex([...document.querySelectorAll('.contact__links .social')]);
  setIndex(navLinks);
  document.querySelectorAll('.rows').forEach((rows) => {
    [...rows.children].forEach((row, i) => {
      if (!row.style.getPropertyValue('--d')) row.style.setProperty('--d', `${i * 0.12}s`);
    });
  });

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

  /* ---------- 4. Menú flotante (abajo a la derecha) ---------- */
  const sectionInfo = { inicio: { num: '00', label: 'Inicio' } };
  navLinks.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const num = document.querySelector(`#${CSS.escape(id)} .section__num`);
    sectionInfo[id] = { num: num ? num.textContent.trim() : '', label: link.textContent.trim() };
  });

  const fnav = document.createElement('div');
  fnav.className = 'fnav';
  fnav.innerHTML = `
    <nav class="fnav__menu" id="fnavMenu" aria-label="Secciones">
      ${Object.entries(sectionInfo).map(([id, info], i) => `
        <a href="#${id}" style="--i:${Object.keys(sectionInfo).length - 1 - i}; --r:${i % 2 ? '1deg' : '-1.5deg'}">
          <small>${escapeHTML(info.num)}</small>${escapeHTML(info.label)}
        </a>`).join('')}
    </nav>
    <button class="fnav__btn" type="button" aria-expanded="false" aria-controls="fnavMenu" aria-label="Abrir menú de secciones">
      <span class="fnav__num">00</span>
      <span class="fnav__label">Inicio</span>
      <span class="fnav__icon" aria-hidden="true"></span>
    </button>`;
  body.append(fnav);

  const fnavBtn = fnav.querySelector('.fnav__btn');
  const fnavNum = fnav.querySelector('.fnav__num');
  const fnavLabel = fnav.querySelector('.fnav__label');
  const fnavLinks = [...fnav.querySelectorAll('.fnav__menu a')];
  const allLinks = [...navLinks, ...fnavLinks];

  function setFnav(open) {
    fnav.classList.toggle('is-open', open);
    fnavBtn.setAttribute('aria-expanded', String(open));
    fnavBtn.setAttribute('aria-label', open ? 'Cerrar menú de secciones' : 'Abrir menú de secciones');
  }

  fnavBtn.addEventListener('click', () => setFnav(!fnav.classList.contains('is-open')));
  document.addEventListener('click', (e) => {
    if (fnav.classList.contains('is-open') && !fnav.contains(e.target)) setFnav(false);
  });

  const setCurrent = (id) => {
    allLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
    const info = sectionInfo[id];
    if (info) {
      fnavNum.textContent = info.num;
      fnavLabel.textContent = info.label;
    }
  };

  /* ---------- 5. Efecto de letras que se descifran (correo de contacto) ---------- */
  const mail = document.querySelector('.contact__mail');
  const mailText = mail ? mail.textContent.trim() : '';
  if (mail) mail.setAttribute('aria-label', mailText);

  const scramble = (el, text, duration = 1400) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@';
    const start = performance.now() + 350;
    const frame = (now) => {
      const t = Math.max(0, Math.min((now - start) / duration, 1));
      const done = Math.floor(t * text.length);
      let out = text.slice(0, done);
      for (let i = done; i < text.length; i++) out += chars[(Math.random() * chars.length) | 0];
      el.textContent = out;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = text;
    };
    requestAnimationFrame(frame);
  };

  /* ---------- 6. Aparición de elementos al hacer scroll ---------- */
  const heroReveals = hero ? [...hero.querySelectorAll('.reveal')] : [];
  const revealEls = [...document.querySelectorAll('.reveal, .head, #sobre-mi .about, .contact__mail')]
    // La foto empieza recortada a 0 px y el navegador no la detecta: se activa junto con su bloque (.about)
    .filter((el) => !heroReveals.includes(el) && !el.matches('.about__photo'));

  const show = (el) => {
    el.classList.add('is-visible');
    if (el === mail && !reducedMotion) scramble(mail, mailText);
    if (el.matches('.about')) el.querySelectorAll('.about__photo').forEach(show);
    const delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
    // "settled": la entrada ya terminó y la tarjeta puede reaccionar al ratón
    setTimeout(() => el.classList.add('settled'), 1300 + delay * 1000);
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

  /* ---------- 7. Pantalla de carga e intro del hero ---------- */
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

  /* ---------- 8. Scroll suave con Lenis (si no carga, se usa el scroll normal) ---------- */
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
    setFnav(false);
    if (lenis) {
      lenis.scrollTo(target, { offset: href === '#inicio' ? 0 : -40, duration: 1.4 });
    } else {
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
    history.replaceState(null, '', href);
  });

  /* ---------- 9. Sección activa (menú de arriba y menú flotante) ---------- */
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- 10. Menú móvil ---------- */
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    body.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  }

  toggle.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    setMenu(false);
    setFnav(false);
  });

  window.addEventListener('resize', () => {
    if (isDesktop()) setMenu(false);
  });

  /* ---------- 11. Efectos con el ratón (solo ordenador) ---------- */
  if (finePointer && !reducedMotion) {
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

  /* ---------- 12. Bucle de animación: scroll suave, parallax, banda y menús ---------- */
  const parallaxEls = [...document.querySelectorAll('.about__photo, .project__img, .head__ghost')];
  let lastY = window.scrollY;
  let velocity = 0;
  let marqueeX = 0;
  let direction = 1;
  let away = null;

  const tick = (time) => {
    if (lenis) lenis.raf(time);

    const y = window.scrollY;
    const vh = window.innerHeight;
    velocity += ((y - lastY) - velocity) * 0.1;
    lastY = y;

    // Barra de progreso
    const max = root.scrollHeight - vh;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;

    // Fuera de la portada: se oculta la barra de arriba y aparece el menú flotante
    const isAway = y > (hero ? hero.offsetHeight * 0.7 : 300);
    if (isAway !== away) {
      away = isAway;
      nav.classList.toggle('is-away', isAway && !body.classList.contains('menu-open'));
      fnav.classList.toggle('is-on', isAway);
      if (!isAway) setFnav(false);
    }

    if (!reducedMotion) {
      // El hero se desplaza más despacio y se desvanece
      if (heroInner && y < vh * 1.3) {
        heroInner.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
        heroInner.style.opacity = Math.max(0, 1 - y / (vh * 0.85)).toFixed(3);
      }

      // Parallax de la foto, las imágenes de proyectos y los números gigantes
      parallaxEls.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const speed = parseFloat(el.dataset.speed) || 40;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.setProperty('--py', `${(p * -speed).toFixed(1)}px`);
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

    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  /* ---------- 13. Año automático en el pie de página ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
