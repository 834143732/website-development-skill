(() => {
  'use strict';
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  root.dataset.ready = 'true';

  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const closeMenu = () => { header?.classList.remove('menu-open'); menuToggle?.setAttribute('aria-expanded', 'false'); };
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader(); window.addEventListener('scroll', updateHeader, { passive: true });
  menuToggle?.addEventListener('click', () => { const open = header.classList.toggle('menu-open'); menuToggle.setAttribute('aria-expanded', String(open)); });
  siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  const heroBg = document.querySelector('[data-hero-bg]');
  const heroData = [{ image: 'hero-factory.jpg' }, { image: 'product-calcium.jpg' }, { image: 'cta-careers.jpg' }];
  const heroTabs = [...document.querySelectorAll('.hero-tabs [data-hero]')];
  let heroIndex = 0; let heroTimer;
  const chooseHero = (index, shouldFocus = false) => {
    heroIndex = (index + heroData.length) % heroData.length;
    if (heroBg) {
      heroBg.classList.remove('is-changing'); heroBg.style.backgroundImage = `url("assets/source/images/${heroData[heroIndex].image}")`;
      if (!reducedMotion.matches) { heroBg.classList.add('is-changing'); window.setTimeout(() => heroBg.classList.remove('is-changing'), 380); }
    }
    heroTabs.forEach((tab, i) => { const active = i === heroIndex; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    if (shouldFocus) heroTabs[heroIndex]?.focus();
  };
  const stopHeroTimer = () => window.clearInterval(heroTimer);
  const startHeroTimer = () => { stopHeroTimer(); if (!reducedMotion.matches && heroTabs.length > 1) heroTimer = window.setInterval(() => chooseHero(heroIndex + 1), 5600); };
  heroTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => { chooseHero(index); startHeroTimer(); });
    tab.addEventListener('keydown', (event) => { if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? heroTabs.length - 1 : event.key === 'ArrowRight' ? index + 1 : index - 1; chooseHero(next, true); startHeroTimer(); });
  });
  reducedMotion.addEventListener?.('change', startHeroTimer); chooseHero(0); startHeroTimer();

  const productData = {
    calcium: { label: 'FAMILY 01 · CALCIUM METAL', title: '金属钙', image: 'product-calcium.jpg', description: '银白色活泼金属，首页自述可按钙锭、钙块、钙屑、钙粒、钙丝、钙压块等形态供货，并支持化学指标、纯度、形态和尺寸的定制讨论。', link: 'https://cn.btjhcm.com/metal', forms: ['钙粒', '钙块', '钙屑', '钙丝', '钙压块'] },
    alloy: { label: 'FAMILY 02 · CALCIUM ALLOYS', title: '钙系合金', image: 'product-alloy.jpg', description: '钙与其他金属构成的合金产品，公开首页将其放在改善合金性能、氧化还原剂和固态燃料添加剂等用途下说明。', link: 'https://cn.btjhcm.com/alloys', forms: ['钙铝合金', '钙镁合金', '稀土钙合金'] }
  };
  const productStage = document.querySelector('[data-product-stage]'); const productLabel = document.querySelector('[data-product-label]'); const productTitle = document.querySelector('[data-product-title]'); const productDescription = document.querySelector('[data-product-description]'); const productLink = document.querySelector('[data-product-link]'); const productTabs = [...document.querySelectorAll('[data-product]')]; const formChips = document.querySelector('[data-form-chips]'); let activeProduct = 'calcium';
  const chooseProduct = (key, shouldFocus = false) => {
    const item = productData[key]; if (!item) return; activeProduct = key;
    if (productStage) { productStage.classList.remove('is-changing'); productStage.style.backgroundImage = `url("assets/source/images/${item.image}")`; if (!reducedMotion.matches) { productStage.classList.add('is-changing'); window.setTimeout(() => productStage.classList.remove('is-changing'), 380); } }
    if (productLabel) productLabel.textContent = item.label; if (productTitle) productTitle.textContent = item.title; if (productDescription) productDescription.textContent = item.description; if (productLink) productLink.href = item.link;
    productTabs.forEach((tab) => { const active = tab.dataset.product === key; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    if (formChips) formChips.innerHTML = item.forms.map((form, i) => `<button type="button" class="chip${i === 0 ? ' is-active' : ''}" data-form="${form}">${form}</button>`).join('');
    if (shouldFocus) productTabs.find((tab) => tab.dataset.product === key)?.focus();
  };
  productTabs.forEach((tab, index) => { tab.addEventListener('click', () => chooseProduct(tab.dataset.product)); tab.addEventListener('keydown', (event) => { if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? productTabs.length - 1 : ['ArrowRight', 'ArrowDown'].includes(event.key) ? index + 1 : index - 1; chooseProduct(productTabs[(next + productTabs.length) % productTabs.length].dataset.product, true); }); });
  formChips?.addEventListener('click', (event) => { const chip = event.target.closest('[data-form]'); if (!chip) return; formChips.querySelectorAll('[data-form]').forEach((item) => item.classList.toggle('is-active', item === chip)); });
  chooseProduct(activeProduct);

  const applicationData = {
    steel: { label: 'SCENE 01 / STEEL & CASTING', title: '钢铁与铸造工业', image: 'application-steel.jpg', description: '金属钙在钢铁铸造工业领域主要用作脱氧剂和脱硫剂。工业场景页可继续补充牌号、加入节点、检测指标和交付方式。' },
    metals: { label: 'SCENE 02 / NON-FERROUS METALS', title: '有色金属冶炼工业', image: 'application-metals.jpg', description: '金属钙在有色金属冶炼工业领域主要用作还原剂，制备稀有和贵重有色金属。场景详情需要继续说明工艺段与化学指标。' },
    chemicals: { label: 'SCENE 03 / CHEMICAL PROCESS', title: '石油与化学工业', image: 'application-chemicals.jpg', description: '金属钙在石油和化学工业领域拥有广泛用途；内容应将“广泛”拆成具体反应、介质、标准和安全要求。' },
    battery: { label: 'SCENE 04 / BATTERY', title: '电池工业', image: 'application-battery.jpg', description: '金属钙在电池工业领域主要用于生产铅钙蓄电池。应用页可以继续连接合金比例、循环寿命、检测和交付批次。' }
  };
  const applicationButtons = [...document.querySelectorAll('[data-application]')]; const applicationImage = document.querySelector('[data-application-image]'); const applicationLabel = document.querySelector('[data-application-label]'); const applicationTitle = document.querySelector('[data-application-title]'); const applicationDescription = document.querySelector('[data-application-description]');
  const chooseApplication = (key, shouldFocus = false) => { const item = applicationData[key]; if (!item) return; if (applicationImage) applicationImage.style.backgroundImage = `url("assets/source/images/${item.image}")`; if (applicationLabel) applicationLabel.textContent = item.label; if (applicationTitle) applicationTitle.textContent = item.title; if (applicationDescription) applicationDescription.textContent = item.description; applicationButtons.forEach((button) => button.setAttribute('aria-selected', String(button.dataset.application === key))); if (shouldFocus) applicationButtons.find((button) => button.dataset.application === key)?.focus(); };
  applicationButtons.forEach((button, index) => { button.addEventListener('click', () => chooseApplication(button.dataset.application)); button.addEventListener('keydown', (event) => { if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? applicationButtons.length - 1 : ['ArrowRight', 'ArrowDown'].includes(event.key) ? index + 1 : index - 1; chooseApplication(applicationButtons[(next + applicationButtons.length) % applicationButtons.length].dataset.application, true); }); });
  chooseApplication('steel');

  const revealItems = [...document.querySelectorAll('.reveal')];
  if (reducedMotion.matches || !('IntersectionObserver' in window)) revealItems.forEach((item) => item.classList.add('is-visible')); else { const observer = new IntersectionObserver((entries, current) => { entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.classList.add('is-visible'); current.unobserve(entry.target); }); }, { threshold: .08, rootMargin: '0px 0px -5% 0px' }); revealItems.forEach((item) => observer.observe(item)); }

  const contactToggle = document.querySelector('.contact-toggle'); const contactPanel = document.querySelector('.contact-panel'); const closeContact = () => { contactPanel?.classList.remove('is-open'); contactToggle?.setAttribute('aria-expanded', 'false'); };
  contactToggle?.addEventListener('click', () => { const open = contactPanel.classList.toggle('is-open'); contactToggle.setAttribute('aria-expanded', String(open)); }); document.addEventListener('click', (event) => { if (!event.target.closest('.contact-rail')) closeContact(); }); document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeContact(); closeMenu(); } });
  const backTop = document.querySelector('[data-back-to-top]'); const updateBackTop = () => backTop?.classList.toggle('is-visible', window.scrollY > 650); updateBackTop(); window.addEventListener('scroll', updateBackTop, { passive: true }); backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
})();
