(function () {
  'use strict';

  // Mobile menu
  const burger = document.querySelector('[data-burger]');
  const mobile = document.querySelector('[data-mobile]');
  if (burger && mobile) {
    burger.addEventListener('click', () => mobile.classList.toggle('show'));
  }

  // FAQ accordion
  document.querySelectorAll('.faq').forEach((f) => {
    const btn = f.querySelector('button');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = f.classList.contains('open');
      document.querySelectorAll('.faq.open').forEach((x) => x.classList.remove('open'));
      if (!isOpen) f.classList.add('open');
    });
  });

  // -----------------------------
  // Hero slider + randomized copy
  // -----------------------------
  const slides = Array.from(document.querySelectorAll('.hero-slider .slide'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const btnPrev = document.querySelector('[data-hero-prev]');
  const btnNext = document.querySelector('[data-hero-next]');
  const hero = document.querySelector('.hero');

  const elKicker = document.querySelector('[data-hero-kicker]');
  const elTitle  = document.querySelector('[data-hero-title]');
  const elSub    = document.querySelector('[data-hero-sub]');
  const btnP     = document.querySelector('[data-hero-btn-primary]');
  const btnS     = document.querySelector('[data-hero-btn-secondary]');
  const elProgress = document.querySelector('[data-hero-progress]');
  const textWrap = document.querySelector('.hero .content > div'); // the left text column wrapper

  // 3 text sets (A/B/C). Each set has 4 slides-worth of copy.
  const heroSets = [
    // Set A (directo conversión)
    [
      { kicker: 'Partner Digital · Paterna', title: 'Partner Digital en Valencia', sub: 'Web + Google Maps + WhatsApp para que te encuentren y te escriban sin complicaciones.', primary: { label: 'Ver servicios', href: '#servicios' }, secondary: { label: 'Contacto', href: '#contacto' } },
      { kicker: 'Comunicación Empresarial', title: 'Responde más rápido', sub: 'Centraliza mensajes y convierte consultas en clientes con WhatsApp profesional y respuestas automáticas.', primary: { label: 'Quiero más contactos', href: '#contacto' }, secondary: { label: 'Ver proceso', href: '#proceso' } },
      { kicker: 'Valencia · Cercanía', title: 'Atendemos en Valencia', sub: 'Paterna, Burjassot, Godella, Manises y alrededores. Presencial o 100% online.', primary: { label: 'Ver zonas', href: '#zonas' }, secondary: { label: 'Ejemplos', href: '#proyectos' } },
      { kicker: 'SEO Local', title: 'Mejora tu posicionamiento', sub: 'Optimiza tu presencia en Google y haz que te elijan antes que a la competencia.', primary: { label: 'Revisión rápida', href: '#contacto' }, secondary: { label: 'Planes', href: '#planes' } },
    ],
    // Set B (premium/consultivo)
    [
      { kicker: 'Impulso Digital', title: 'Crecimiento para negocios locales', sub: 'Diseñamos tu sistema online para atraer clientes desde Google y WhatsApp.', primary: { label: 'Empezar', href: '#contacto' }, secondary: { label: 'Servicios', href: '#servicios' } },
      { kicker: 'Atención al cliente', title: 'Orden y control en tu comunicación', sub: 'Respuestas rápidas, horarios, servicios y captación en un solo flujo de atención.', primary: { label: 'Ver cómo funciona', href: '#proceso' }, secondary: { label: 'Contacto', href: '#contacto' } },
      { kicker: 'Zona Valencia', title: 'Local, cercano y rápido', sub: 'Trabajamos contigo en la zona para que tu negocio destaque donde importa: tu barrio.', primary: { label: 'Contactar', href: '#contacto' }, secondary: { label: 'Zonas', href: '#zonas' } },
      { kicker: 'Visibilidad', title: 'Más visibilidad, más clientes', sub: 'SEO local + Google Maps + reputación digital para crecer sin depender del boca a boca.', primary: { label: 'Auditoría', href: '#contacto' }, secondary: { label: 'Planes', href: '#planes' } },
    ],
    // Set C (enfoque nichos)
    [
      { kicker: 'Web que convierte', title: 'Visitas que se vuelven mensajes', sub: 'Diseño pensado para que te contacten (WhatsApp, llamadas y formularios).', primary: { label: 'Ver ejemplos', href: '#proyectos' }, secondary: { label: 'Servicios', href: '#servicios' } },
      { kicker: 'Automatización', title: 'Atención al cliente inteligente', sub: 'Menos “ida y vuelta”, más citas y reservas con mensajes claros y rápidos.', primary: { label: 'Quiero automatizar', href: '#contacto' }, secondary: { label: 'Proceso', href: '#proceso' } },
      { kicker: 'SEO Valencia', title: 'Presencia local fuerte', sub: 'Te optimizamos para búsquedas como “cerca de mí” y “en Paterna”.', primary: { label: 'Ver zonas', href: '#zonas' }, secondary: { label: 'Planes', href: '#planes' } },
      { kicker: 'Reputación', title: 'Posicionamiento y confianza', sub: 'Reseñas + SEO local para que confíen en ti antes de llamarte.', primary: { label: 'Revisar mi Google', href: '#contacto' }, secondary: { label: 'Servicios', href: '#servicios' } },
    ],
  ];

  const chosenSet = heroSets[Math.floor(Math.random() * heroSets.length)];

  function applyCopy(index, withFade = true) {
    if (!chosenSet || !chosenSet[index]) return;

    const c = chosenSet[index];

    const update = () => {
      if (elKicker) elKicker.textContent = c.kicker;
      if (elTitle)  elTitle.textContent = c.title;
      if (elSub)    elSub.textContent = c.sub;

      if (btnP) {
        btnP.textContent = c.primary.label;
        btnP.setAttribute('href', c.primary.href);
      }
      if (btnS) {
        btnS.textContent = c.secondary.label;
        btnS.setAttribute('href', c.secondary.href);
      }
    };

    if (!withFade || !textWrap) {
      update();
      return;
    }

    // Fade-out then update then fade-in (CSS controls transitions)
    textWrap.classList.add('hero-text-fade-out');
    window.setTimeout(() => {
      update();
      textWrap.classList.remove('hero-text-fade-out');
      textWrap.classList.add('hero-text-fade-in');
      window.setTimeout(() => textWrap.classList.remove('hero-text-fade-in'), 350);
    }, 220);
  }

  // Slider logic
  if (slides.length) {
    let current = 0;
    let timer = null;
    const intervalMs = 6000;

    function restartProgress() {
      if (!elProgress) return;
      // restart CSS animation
      elProgress.classList.remove("is-animating");
      // force reflow
      void elProgress.offsetWidth;
      elProgress.style.animationDuration = intervalMs + "ms";
      elProgress.classList.add("is-animating");
    }


    function show(i, fromAuto = false) {
      const nextIndex = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === nextIndex));
      dots.forEach((d, idx) => d.classList.toggle('is-active', idx === nextIndex));
      current = nextIndex;
      applyCopy(current, true);
    }

    function next() { show(current + 1); }
    function prev() { show(current - 1); }

    function start() {
      stop();
      timer = window.setInterval(() => next(), intervalMs);
    }
    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    // Initial
    show(0);
    start();

    if (btnNext) btnNext.addEventListener('click', () => { next(); start(); });
    if (btnPrev) btnPrev.addEventListener('click', () => { prev(); start(); });

    dots.forEach((d) => {
      d.addEventListener('click', () => {
        const idx = parseInt(d.getAttribute('data-hero-dot') || '0', 10);
        show(idx);
        start();
      });
    });

    if (hero) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      hero.addEventListener('touchstart', stop, { passive: true });
      hero.addEventListener('touchend', start, { passive: true });
    }
  }

  // -----------------------------
  // Scrollspy (active menu item)
  // -----------------------------
  const navLinks = Array.from(document.querySelectorAll('.menu a[href^="#"]'));
  const sectionById = new Map();
  navLinks.forEach((a) => {
    const id = (a.getAttribute('href') || '').slice(1);
    const sec = document.getElementById(id);
    if (id && sec) sectionById.set(id, sec);
  });

  function setActive(id) {
    navLinks.forEach((a) => {
      const aId = (a.getAttribute('href') || '').slice(1);
      a.classList.toggle('active', aId === id);
      if (aId === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  const sections = Array.from(sectionById.values());
  if (sections.length) {
    let ticking = false;

    function updateActive() {
      // Use a point a bit below the top (accounts for fixed header)
      const probeY = window.scrollY + window.innerHeight * 0.35;
      let current = sections[0].id;

      for (const sec of sections) {
        if (sec.offsetTop <= probeY) current = sec.id;
      }
      setActive(current);
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateActive);
        }
      },
      { passive: true }
    );

    // Set initial state
    updateActive();
  }

  // Active state on click (instant feedback)
  navLinks.forEach((a) => {
    a.addEventListener('click', () => {
      const id = (a.getAttribute('href') || '').slice(1);
      if (id) setActive(id);
      if (mobile) mobile.classList.remove('show');
    });
  });



  // Project cards -> prefill contact form
  const projectCards = Array.from(document.querySelectorAll('.project[data-project]'));
  const projectInput = document.querySelector('form.form input[name="proyecto"]');
  const messageArea = document.querySelector('form.form textarea[name="mensaje"]');
  projectCards.forEach((card) => {
    card.addEventListener('click', () => {
      const name = card.getAttribute('data-project') || '';
      if (projectInput && name) {
        projectInput.value = name;
      }
      // Optional: focus message so user can type immediately
      if (messageArea) setTimeout(() => messageArea.focus(), 250);
    });
  });

})();