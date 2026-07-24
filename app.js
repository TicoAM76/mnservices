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

  // El texto principal permanece estable.
  // El carrusel solo cambia las imágenes.

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


  // Contact form -> Cloudflare Pages Function
  const contactForm = document.querySelector('#contact-form');
  const formStatus = document.querySelector('[data-form-status]');

  if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = contactForm.querySelector(
        'button[type="submit"]'
      );

      const originalButtonText = submitButton
        ? submitButton.textContent
        : '';

      if (formStatus) {
        formStatus.textContent = '';
        formStatus.classList.remove('is-success', 'is-error');
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
      }

      const formData = new FormData(contactForm);

      const payload = {
        nombre: formData.get('nombre') || '',
        empresa: formData.get('empresa') || '',
        email: formData.get('email') || '',
        telefono: formData.get('telefono') || '',
        servicio: formData.get('servicio') || '',
        mensaje: formData.get('mensaje') || '',
        website: formData.get('website') || '',
        origen: window.location.href,
      };

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        let result = {};

        try {
          result = await response.json();
        } catch {
          result = {};
        }

        if (!response.ok || !result.ok) {
          throw new Error(
            result.message ||
              'No pudimos enviar tu solicitud. Inténtalo de nuevo.'
          );
        }

        contactForm.reset();

        if (formStatus) {
          formStatus.textContent =
            result.message ||
            'Hemos recibido tu solicitud. Te responderemos lo antes posible.';

          formStatus.classList.add('is-success');
        }
      } catch (error) {
        console.error('Error enviando el formulario:', error);

        if (formStatus) {
          formStatus.textContent =
            error.message ||
            'Se produjo un error. Escríbenos por WhatsApp o correo.';

          formStatus.classList.add('is-error');
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });
  }

})();