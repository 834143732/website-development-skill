(() => {
  const root = document.documentElement;
  root.dataset.motion = 'on';
  const header = document.querySelector('[data-header]');
  const backTop = document.querySelector('[data-back-top]');
  const toast = document.querySelector('[data-toast]');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
  };

  const updateScrollState = () => {
    const scrolled = window.scrollY > 24;
    header?.classList.toggle('is-scrolled', scrolled);
    backTop?.classList.toggle('is-visible', window.scrollY > 520);
  };
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    mobileNav?.classList.toggle('is-open', !open);
  });
  mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('is-open');
  }));

  const tabRoot = document.querySelector('[data-tabs]');
  if (tabRoot) {
    const tabs = [...tabRoot.querySelectorAll('[data-tab]')];
    const panels = [...tabRoot.querySelectorAll('[data-panel]')];
    const activate = (name, moveFocus = false) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.tab === name;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && moveFocus) tab.focus();
      });
      panels.forEach((panel) => {
        const active = panel.dataset.panel === name;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab.dataset.tab));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        activate(tabs[next].dataset.tab, true);
      });
    });
    tabRoot.querySelectorAll('[data-demo-next]').forEach((button) => button.addEventListener('click', () => {
      const active = tabs.findIndex((tab) => tab.classList.contains('is-active'));
      activate(tabs[(active + 1) % tabs.length].dataset.tab, true);
    }));
  }

  document.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
    const value = button.dataset.copy || '';
    try {
      await navigator.clipboard.writeText(value);
      showToast('规则已复制');
    } catch {
      showToast(value);
    }
  }));

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Keep in-page links from hiding the target beneath the fixed header.
  document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    const offset = (header?.offsetHeight || 0) + 12;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
    history.replaceState(null, '', link.getAttribute('href'));
  }));

  root.dataset.ready = 'true';
})();
