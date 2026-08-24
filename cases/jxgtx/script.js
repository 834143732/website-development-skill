(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  root.dataset.ready = 'true';

  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  const closeMenu = () => {
    if (!header || !menuToggle) return;
    header.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 22);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  menuToggle?.addEventListener('click', () => {
    const isOpen = header.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  const heroMedia = document.querySelector('[data-hero-media]');
  const heroSlides = [
    { className: '' },
    { className: 'is-qx43' },
    { className: 'is-fx39' },
    { className: 'is-ex39' },
    { className: 'is-connector' }
  ];
  const heroTabs = [...document.querySelectorAll('.hero-tabs [data-hero]')];
  let heroIndex = 0;
  let heroTimer;

  const chooseHero = (index, shouldFocus = false) => {
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    if (heroMedia) {
      heroMedia.classList.remove('is-qx43', 'is-fx39', 'is-ex39', 'is-connector');
      if (heroSlides[heroIndex].className) heroMedia.classList.add(heroSlides[heroIndex].className);
      heroMedia.classList.remove('is-changing');
      if (!reducedMotion.matches) {
        window.requestAnimationFrame(() => heroMedia.classList.add('is-changing'));
        window.setTimeout(() => heroMedia.classList.remove('is-changing'), 340);
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
    if (!reducedMotion.matches) heroTimer = window.setInterval(() => chooseHero(heroIndex + 1), 4000);
  };
  heroTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => { chooseHero(index); startHeroTimer(); });
    tab.addEventListener('keydown', (event) => {
      const key = event.key;
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(key)) return;
      event.preventDefault();
      const next = key === 'Home' ? 0 : key === 'End' ? heroTabs.length - 1 : key === 'ArrowRight' ? index + 1 : index - 1;
      chooseHero(next, true);
      startHeroTimer();
    });
  });
  reducedMotion.addEventListener?.('change', startHeroTimer);
  chooseHero(0);
  startHeroTimer();

  const familyData = {
    fusion: { label: 'FAMILY 01 · SPLICE', title: '光纤熔接机', image: 'category-fusion.webp', description: '从六马达干线机到 FTTx 皮线机，原站先用场景与效率描述品类，再把用户带向具体型号与咨询动作。', link: 'https://www.jxgtx.com/fusion-fiber' },
    otdr: { label: 'FAMILY 02 · TEST', title: 'OTDR', image: 'category-otdr.webp', description: '用光时域反射定位链路事件，面向 FTTx、铁路、煤矿等现场，把复杂测量翻译成可执行的排障步骤。', link: 'https://www.jxgtx.com/otdr' },
    measuring: { label: 'FAMILY 03 · MEASURE', title: '测量仪器', image: 'category-measuring.webp', description: '光功率计、光源、红光源、端面检测和工程测试仪器组成基础测量层，适合按工序组合工具。', link: 'https://www.jxgtx.com/measure' },
    odn: { label: 'FAMILY 04 · DISTRIBUTE', title: 'ODN 网络', image: 'category-odn.webp', description: '把光缆、连接器、分光器箱、光缆接头盒等传输与分配组件放进同一网络语境，而不是孤立展示零件。', link: 'https://www.jxgtx.com/odn' },
    cleaning: { label: 'FAMILY 05 · CLEAN', title: '光纤清洁', image: 'category-cleaning.webp', description: '端面洁净度直接影响连接质量，原站用检测与清洁组合提醒用户：稳定链路从细节维护开始。', link: 'https://www.jxgtx.com/cleaning' },
    tools: { label: 'FAMILY 06 · TOOL', title: '光纤工具', image: 'category-tools.webp', description: '切割刀、剥线钳等工具承接施工动作，并通过合作与行业场景增强专业工具的可信度。', link: 'https://www.jxgtx.com/tools' }
  };
  const familyStage = document.querySelector('[data-family-stage]');
  const familyLabel = document.querySelector('[data-family-label]');
  const familyTitle = document.querySelector('[data-family-title]');
  const familyDescription = document.querySelector('[data-family-description]');
  const familyLink = document.querySelector('[data-family-link]');
  const familyTabs = [...document.querySelectorAll('.family-selector [data-family]')];
  let activeFamily = 'fusion';

  const chooseFamily = (key, shouldFocus = false) => {
    const item = familyData[key];
    if (!item) return;
    activeFamily = key;
    if (familyStage) {
      familyStage.classList.remove('is-changing');
      if (!reducedMotion.matches) {
        familyStage.classList.add('is-changing');
        window.setTimeout(() => familyStage.classList.remove('is-changing'), 360);
      }
      familyStage.style.backgroundImage = `url("assets/source/images/${item.image}")`;
    }
    if (familyLabel) familyLabel.textContent = item.label;
    if (familyTitle) familyTitle.textContent = item.title;
    if (familyDescription) familyDescription.textContent = item.description;
    if (familyLink) familyLink.href = item.link;
    familyTabs.forEach((tab) => {
      const active = tab.dataset.family === key;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    if (shouldFocus) familyTabs.find((tab) => tab.dataset.family === key)?.focus();
  };
  familyTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => chooseFamily(tab.dataset.family));
    tab.addEventListener('keydown', (event) => {
      const key = event.key;
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(key)) return;
      event.preventDefault();
      const next = key === 'Home' ? 0 : key === 'End' ? familyTabs.length - 1 : ['ArrowRight', 'ArrowDown'].includes(key) ? index + 1 : index - 1;
      const bounded = (next + familyTabs.length) % familyTabs.length;
      chooseFamily(familyTabs[bounded].dataset.family, true);
    });
  });
  chooseFamily(activeFamily);

  const motionData = [
    { label: 'CHAPTER 01 · HERO', heading: '先让现场动作进入视线', description: 'Hero 由 5 张 1920×750 图片组成，Swiper 4 秒自动切换、圆点可点击，文字用 fadeInUp 与场景同步。', image: 'hero-qx43.webp', points: ['设备先建立尺度', '参数再给证据', '按钮承接分类'] },
    { label: 'CHAPTER 02 · FAMILY', heading: '让一次切换，回答一个任务', description: '六类产品共享一个视觉舞台，切换时更新图片、用途和分类链接，减少重复页面造成的认知负担。', image: 'category-fusion.webp', points: ['分类先于 SKU', '图片保持同一比例', '详情承接深度'] },
    { label: 'CHAPTER 03 · PROOF', heading: '把企业实力放进可读的尺度', description: 'CountUp 只负责让数字进入视线，数字旁边必须写清指标名称、单位、时间和验证边界。', image: 'about-team.webp', points: ['静态值可读', '口径要透明', '动画可关闭'] },
    { label: 'CHAPTER 04 · NEWS', heading: '用中心尺度提示内容优先级', description: '新闻和展会模块可以用中心放大、边缘收窄的轮播表现近期节奏，但每张卡仍需保留标题、日期和可点击区域。', image: 'news-current.webp', points: ['中心卡突出', '边缘仍可扫读', '日期辅助判断'] },
    { label: 'CHAPTER 05 · FALLBACK', heading: '没有脚本，也要保留路径', description: '图片背景、静态标题、原生链接和可见焦点构成最低可用层；交互只增强阅读，不应成为内容的唯一入口。', image: 'hero-connector.webp', points: ['背景可替换', '链接是真链接', '尊重 reduced-motion'] }
  ];
  const motionTabs = [...document.querySelectorAll('.motion-tabs [data-motion]')];
  const motionArt = document.querySelector('[data-motion-art]');
  const motionLabel = document.querySelector('[data-motion-label]');
  const motionHeading = document.querySelector('[data-motion-heading]');
  const motionDescription = document.querySelector('[data-motion-description]');
  const motionPoints = document.querySelector('[data-motion-points]');
  let motionIndex = 0;
  const chooseMotion = (index, shouldFocus = false) => {
    motionIndex = (index + motionData.length) % motionData.length;
    const item = motionData[motionIndex];
    if (motionArt) {
      motionArt.classList.remove('is-changing');
      if (!reducedMotion.matches) {
        motionArt.classList.add('is-changing');
        window.setTimeout(() => motionArt.classList.remove('is-changing'), 360);
      }
      motionArt.style.backgroundImage = `url("assets/source/images/${item.image}")`;
    }
    if (motionLabel) motionLabel.textContent = item.label;
    if (motionHeading) motionHeading.textContent = item.heading;
    if (motionDescription) motionDescription.textContent = item.description;
    if (motionPoints) motionPoints.innerHTML = item.points.map((point) => `<li>${point}</li>`).join('');
    motionTabs.forEach((tab, tabIndex) => {
      const active = tabIndex === motionIndex;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    if (shouldFocus) motionTabs[motionIndex]?.focus();
  };
  motionTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => chooseMotion(index));
    tab.addEventListener('keydown', (event) => {
      const key = event.key;
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(key)) return;
      event.preventDefault();
      const next = key === 'Home' ? 0 : key === 'End' ? motionTabs.length - 1 : ['ArrowRight', 'ArrowDown'].includes(key) ? index + 1 : index - 1;
      chooseMotion((next + motionTabs.length) % motionTabs.length, true);
    });
  });
  chooseMotion(motionIndex);

  const revealItems = [...document.querySelectorAll('.reveal')];
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
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
  const updateBackTop = () => backTop?.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.65);
  updateBackTop();
  window.addEventListener('scroll', updateBackTop, { passive: true });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    closeMenu();
    closeContact();
  });
})();
