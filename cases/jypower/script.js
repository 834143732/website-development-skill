(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  root.dataset.ready = 'true';

  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const closeMenu = () => {
    header?.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  };
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 22);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  menuToggle?.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  const heroBg = document.querySelector('[data-hero-bg]');
  const heroData = [
    { image: 'hero-supplier.jpg' },
    { image: 'hero-innovation.jpg' },
    { image: 'hero-sustainable.jpg' },
    { image: 'hero-service.png' }
  ];
  const heroTabs = [...document.querySelectorAll('.hero-tabs [data-hero]')];
  let heroIndex = 0;
  let heroTimer;
  const chooseHero = (index, shouldFocus = false) => {
    heroIndex = (index + heroData.length) % heroData.length;
    if (heroBg) {
      heroBg.classList.remove('is-changing');
      heroBg.style.backgroundImage = `url("assets/source/images/${heroData[heroIndex].image}")`;
      if (!reducedMotion.matches) {
        heroBg.classList.add('is-changing');
        window.setTimeout(() => heroBg.classList.remove('is-changing'), 360);
      }
    }
    heroTabs.forEach((tab, tabIndex) => {
      const active = tabIndex === heroIndex;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    if (shouldFocus) heroTabs[heroIndex]?.focus();
  };
  const stopHeroTimer = () => window.clearInterval(heroTimer);
  const startHeroTimer = () => {
    stopHeroTimer();
    if (!reducedMotion.matches) heroTimer = window.setInterval(() => chooseHero(heroIndex + 1), 5200);
  };
  heroTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => { chooseHero(index); startHeroTimer(); });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? heroTabs.length - 1 : event.key === 'ArrowRight' ? index + 1 : index - 1;
      chooseHero(next, true); startHeroTimer();
    });
  });
  reducedMotion.addEventListener?.('change', startHeroTimer);
  chooseHero(0); startHeroTimer();

  const productData = {
    acdc: { label: 'FAMILY 01 · CONVERT', title: 'AC/DC 功率转换控制器', image: 'product-acdc.jpg', description: 'AC-DC 控制器及器件，适配多场景电源需求。原站用一句结果导向说明降低了工程师进入长目录前的理解成本。', link: 'https://www.jypower.cn/AC-DC' },
    usb: { label: 'FAMILY 02 · CHARGE', title: 'USB PD or Type C', image: 'product-usb-pd.jpg', description: 'USB-C/PD 高功率充电完整解决方案，适配多终端；产品命名直接贴近接口标准与终端结果。', link: 'https://www.jypower.cn/usb' },
    devices: { label: 'FAMILY 03 · SWITCH', title: '功率器件', image: 'product-devices.jpg', description: '用功率器件承接 MOSFET、二极管、整流桥和 SiC 等具体选择，帮助用户从方案回到关键元件。', link: 'https://www.jypower.cn/Discrete-Power-Devices' },
    sr: { label: 'FAMILY 04 · RECOVER', title: '同步整流控制器', image: 'product-sr.jpg', description: '高效电源核心技术，赋能多领域快充；分类说明先讲效率收益，再让详情页承接电气参数。', link: 'https://www.jypower.cn/SR-Controller' },
    hall: { label: 'FAMILY 05 · SENSE', title: '霍尔与 DC-DC 控制器', image: 'product-hall-dc.jpg', description: '把霍尔开关与 DC-DC 组合为一组感知与调节任务，减少工程师在平行目录中的搜索成本。', link: 'https://www.jypower.cn/Hall-Devices-DC-to-DC-Converter' },
    reference: { label: 'FAMILY 06 · SHAPE', title: '参考电压、运放及光耦', image: 'product-reference.jpg', description: '2.5V、1.24V 参考电压、运算放大器和光电耦合组成信号调理层；数字指标必须在详情和规格表中核验。', link: 'https://www.jypower.cn/Reference-Voltage' }
  };
  const productStage = document.querySelector('[data-product-stage]');
  const productLabel = document.querySelector('[data-product-label]');
  const productTitle = document.querySelector('[data-product-title]');
  const productDescription = document.querySelector('[data-product-description]');
  const productLink = document.querySelector('[data-product-link]');
  const productTabs = [...document.querySelectorAll('.product-selector [data-product]')];
  let activeProduct = 'acdc';
  const chooseProduct = (key, shouldFocus = false) => {
    const item = productData[key];
    if (!item) return;
    activeProduct = key;
    if (productStage) {
      productStage.classList.remove('is-changing');
      productStage.style.backgroundImage = `url("assets/source/images/${item.image}")`;
      if (!reducedMotion.matches) {
        productStage.classList.add('is-changing');
        window.setTimeout(() => productStage.classList.remove('is-changing'), 360);
      }
    }
    if (productLabel) productLabel.textContent = item.label;
    if (productTitle) productTitle.textContent = item.title;
    if (productDescription) productDescription.textContent = item.description;
    if (productLink) productLink.href = item.link;
    productTabs.forEach((tab) => {
      const active = tab.dataset.product === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    if (shouldFocus) productTabs.find((tab) => tab.dataset.product === key)?.focus();
  };
  productTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => chooseProduct(tab.dataset.product));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? productTabs.length - 1 : ['ArrowRight', 'ArrowDown'].includes(event.key) ? index + 1 : index - 1;
      chooseProduct(productTabs[(next + productTabs.length) % productTabs.length].dataset.product, true);
    });
  });
  chooseProduct(activeProduct);

  const revealItems = [...document.querySelectorAll('.reveal')];
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, current) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        current.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach((item) => observer.observe(item));
  }

  const contactToggle = document.querySelector('.contact-toggle');
  const contactPanel = document.querySelector('.contact-panel');
  const closeContact = () => {
    contactPanel?.classList.remove('is-open');
    contactToggle?.setAttribute('aria-expanded', 'false');
  };
  contactToggle?.addEventListener('click', () => {
    const open = contactPanel.classList.toggle('is-open');
    contactToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (event) => {
    if (contactPanel?.classList.contains('is-open') && !event.target.closest('.contact-rail')) closeContact();
  });
  const backTop = document.querySelector('[data-back-to-top]');
  const updateBackTop = () => backTop?.classList.toggle('is-visible', window.scrollY > window.innerHeight * .65);
  updateBackTop();
  window.addEventListener('scroll', updateBackTop, { passive: true });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeMenu();
    closeContact();
  });
})();
