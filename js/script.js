/* Navegação progressiva: permanece acessível sem JavaScript. */
(() => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#main-menu');
  if (!toggle || !menu) return;
  document.body.classList.add('js-ready');
  toggle.hidden = false;
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    toggle.innerHTML = open ? 'Fechar <span aria-hidden="true">×</span>' : 'Menu <span aria-hidden="true">☰</span>';
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) setOpen(false);
  });
  window.matchMedia('(min-width: 641px)').addEventListener('change', () => setOpen(false));
})();


/* Efeitos opcionais: todo o conteúdo permanece visível sem animações. */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const animations = new Set();
  const observers = [];
  const cleanups = [];
  const animatedNumbers = new Map();
  let progressFrame = 0;
  let progressEnabled = false;
  const progress = document.querySelector('.scroll-progress');

  const animateElement = (element, frames, options) => {
    if (typeof element.animate !== 'function') return;
    const animation = element.animate(frames, options);
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation)).catch(() => animations.delete(animation));
  };

  const updateProgress = () => {
    progressFrame = 0;
    if (!progress || !progressEnabled) return;
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const value = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
    progress.style.transform = 'scaleX(' + value + ')';
  };
  const requestProgress = () => {
    if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress);
  };

  const stopEffects = () => {
    observers.splice(0).forEach(observer => observer.disconnect());
    animations.forEach(animation => animation.cancel());
    animations.clear();
    animatedNumbers.forEach((state, element) => {
      cancelAnimationFrame(state.frame);
      element.textContent = state.finalText;
    });
    animatedNumbers.clear();
    cleanups.splice(0).forEach(cleanup => cleanup());
    progressEnabled = false;
    cancelAnimationFrame(progressFrame);
    progressFrame = 0;
    if (progress) progress.style.transform = 'scaleX(0)';
  };

  const startEffects = () => {
    if (preference.matches) return;
    progressEnabled = true;
    window.addEventListener('scroll', requestProgress, { passive: true });
    window.addEventListener('resize', requestProgress, { passive: true });
    cleanups.push(() => {
      window.removeEventListener('scroll', requestProgress);
      window.removeEventListener('resize', requestProgress);
    });
    requestProgress();

    if ('IntersectionObserver' in window) {
      const reveal = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          reveal.unobserve(entry.target);
          animateElement(entry.target, [
            { opacity: .15, transform: 'translateY(22px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ], { duration: 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
        });
      }, { threshold: .08 });
      document.querySelectorAll('.section-heading, .about-grid, .values-grid article, .challenge-list>div, .service-card, .logo-tile, .testimonial-grid figure, .partner-grid>div, .contact-form, .solution-grid, .representation-cards article, .tax-grid article').forEach(element => reveal.observe(element));
      observers.push(reveal);

      const count = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const element = entry.target;
          count.unobserve(element);
          const target = Number(element.dataset.count);
          if (!Number.isFinite(target)) return;
          const state = { finalText: element.textContent, frame: 0 };
          animatedNumbers.set(element, state);
          const start = performance.now();
          const tick = now => {
            const elapsed = Math.min(1, (now - start) / 1300);
            const eased = 1 - Math.pow(1 - elapsed, 3);
            element.textContent = Math.round(target * (.65 + .35 * eased)).toLocaleString('pt-BR');
            if (elapsed < 1) state.frame = requestAnimationFrame(tick);
            else {
              element.textContent = state.finalText;
              animatedNumbers.delete(element);
            }
          };
          state.frame = requestAnimationFrame(tick);
        });
      }, { threshold: .6 });
      document.querySelectorAll('.counter-value').forEach(element => count.observe(element));
      observers.push(count);
    }

    if (finePointer.matches) {
      document.querySelectorAll('.service-card').forEach(card => {
        const move = event => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--pointer-x', (event.clientX - rect.left) + 'px');
          card.style.setProperty('--pointer-y', (event.clientY - rect.top) + 'px');
        };
        card.addEventListener('pointermove', move, { passive: true });
        cleanups.push(() => {
          card.removeEventListener('pointermove', move);
          card.style.removeProperty('--pointer-x');
          card.style.removeProperty('--pointer-y');
        });
      });
    }
  };

  preference.addEventListener('change', () => { stopEffects(); startEffects(); });
  document.addEventListener('visibilitychange', () => {
    document.body.classList.toggle('motion-paused', document.hidden);
    animations.forEach(animation => document.hidden ? animation.pause() : animation.play());
  });
  startEffects();
})();
