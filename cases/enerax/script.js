(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  root.dataset.ready = 'true';
  if (!prefersReducedMotion.matches) root.dataset.motion = 'on';

  const header = document.querySelector('[data-header]');
  const topButton = document.querySelector('[data-back-to-top]');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');

  const setHeaderState = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 30);
    topButton?.classList.toggle('is-visible', window.scrollY > 520);
  };
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const closeMenu = () => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    header?.classList.remove('menu-open');
  };
  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    nav?.classList.toggle('is-open', !isOpen);
    header?.classList.toggle('menu-open', !isOpen);
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' }));

  const archData = [
    { image: 'assets/source/images/product-portable.png', label: 'PRODUCT FAMILY 01', title: '移动电源', description: '从便携式应急电源、储能系统到移动充储车，把电能变成可以被带走、部署和调度的资产。', link: 'https://www.enerax.cn/yi' },
    { image: 'assets/source/images/product-mobile-charge.png', label: 'PRODUCT FAMILY 02', title: '补能装置', description: '移动充电、移动换电和商用车换电站，回答车辆在不同路线、班次与场站中的补能效率。', link: 'https://www.enerax.cn/buenng' },
    { image: 'assets/source/images/product-digital-platform.png', label: 'PRODUCT FAMILY 03', title: '数字能源管理平台', description: '将充换电设备、订单、车辆与运营数据连接起来，让一次设备部署可以继续变成可观测的能源服务。', link: 'https://www.enerax.cn/shu' }
  ];
  const productData = {
    portable: { image: 'assets/source/images/product-portable.png', label: 'PRODUCT SAMPLE 01 · MOBILE POWER', title: '便携式应急电源', description: '用“设备名称 + 场景分类 + 图片 + 详情入口”建立第一轮采购判断；性能参数、适配范围和交付条件应继续下沉到详情页。', link: 'https://www.enerax.cn/nbxll/177' },
    mobile: { image: 'assets/source/images/product-mobile-charge.png', label: 'PRODUCT SAMPLE 02 · REPLENISHMENT', title: '移动充储车', description: '把储能和移动充电能力放进同一台可调度设备，适合在固定站点尚未覆盖或临时峰值出现时补上能源缺口。', link: 'https://www.enerax.cn/nypower/140' },
    swap: { image: 'assets/source/images/product-truck-swap.png', label: 'PRODUCT SAMPLE 03 · SWAP STATION', title: '商用车顶吊式单通道换电站', description: '通过车辆、吊装和电池流转的整套画面解释效率；详情页还应补充吞吐量、站点条件、兼容车型和服务边界。', link: 'https://www.enerax.cn/nqmega/6' },
    platform: { image: 'assets/source/images/product-digital-platform.png', label: 'PRODUCT SAMPLE 04 · DIGITAL ENERGY', title: '充换电运营平台', description: '平台入口不应只是软件名称，而要说明它如何连接设备、车辆、订单、告警和运营数据，帮助客户理解持续服务价值。', link: 'https://www.enerax.cn/shu/108' }
  };
  const motionData = [
    { image: 'assets/source/images/hero-poster.png', label: 'CHAPTER 01 · HERO', title: '先让访客看见“电”正在被使用', description: '视频 poster、设备近景、黑色导航和绿色 CTA 组成第一轮品牌判断；视频必须有静态 poster、暂停控制和文字替代。', points: ['场景先于规格', '自动播放默认静音', '文字不能只存在于画面'] },
    { image: 'assets/source/images/product-mobile-charge.png', label: 'CHAPTER 02 · PRODUCT', title: '先按决策任务分组', description: '产品分类先解决“我该从哪一层开始看”，图片与短标题再承担扫描和比较；参数应留给详情页。', points: ['三层入口减少认知负担', '卡片可触摸、可聚焦', '详情页承接规格'] },
    { image: 'assets/source/images/app-port.png', label: 'CHAPTER 03 · APPLICATION', title: '场景卡片负责筛选', description: '行业图像不是背景墙，而是把重载、固定路线、短停靠与连续作业变成选择产品的线索。', points: ['场景写运营约束', '卡片链接到解决方案', '避免只写行业口号'] },
    { image: 'assets/source/images/mission-bg.jpg', label: 'CHAPTER 04 · PROOF', title: '使命句后面必须有数字', description: '“Power At Ease”提供记忆点，统计条提供继续核验的入口；生产项目必须标注口径、日期和来源。', points: ['主张短而可记', '数字带来源和截止日', '不把自述当成第三方结论'] },
    { image: 'assets/source/images/news-01.jpg', label: 'CHAPTER 05 · NEWS', title: '日期证明品牌仍在发生', description: '新闻和伙伴内容让工业官网脱离静态目录；每一条内容都应可追溯到原文、事件和时间。', points: ['日期比装饰更重要', '新闻连接真实事件', '伙伴墙需要上下文'] }
  ];

  const moveFocus = (items, current, direction) => {
    const next = (current + direction + items.length) % items.length;
    items[next].focus();
    return next;
  };
  const setupRovingTabs = (items, select, selectedIndex) => {
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === selectedIndex ? '0' : '-1');
      item.addEventListener('click', () => select(index, true));
      item.addEventListener('keydown', (event) => {
        let next = -1;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = moveFocus(items, index, 1);
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = moveFocus(items, index, -1);
        if (event.key === 'Home') { items[0].focus(); next = 0; }
        if (event.key === 'End') { items[items.length - 1].focus(); next = items.length - 1; }
        if (next >= 0) { event.preventDefault(); select(next, false); }
      });
    });
  };

  const archPanel = document.querySelector('[data-arch-panel]');
  const archButtons = [...document.querySelectorAll('[data-arch]')];
  const chooseArchitecture = (index, focus = false) => {
    const data = archData[index];
    if (!data || !archPanel) return;
    archPanel.classList.remove('is-changing');
    void archPanel.offsetWidth;
    archPanel.classList.add('is-changing');
    window.setTimeout(() => archPanel.classList.remove('is-changing'), 260);
    const art = archPanel.querySelector('[data-arch-art]');
    if (art) art.style.backgroundImage = `url("${data.image}")`;
    archPanel.querySelector('[data-arch-label]').textContent = data.label;
    archPanel.querySelector('[data-arch-title]').textContent = data.title;
    archPanel.querySelector('[data-arch-description]').textContent = data.description;
    archPanel.querySelector('[data-arch-current]').textContent = String(index + 1).padStart(2, '0');
    const link = archPanel.querySelector('.text-link');
    if (link) link.href = data.link;
    archButtons.forEach((button, buttonIndex) => {
      button.setAttribute('aria-selected', String(buttonIndex === index));
      button.setAttribute('tabindex', buttonIndex === index ? '0' : '-1');
    });
    if (focus) archButtons[index]?.focus();
  };
  setupRovingTabs(archButtons, chooseArchitecture, 0);
  chooseArchitecture(0);

  const productButtons = [...document.querySelectorAll('[data-product]')];
  const productLab = document.querySelector('[data-product-lab]');
  const productVisual = document.querySelector('[data-product-visual]');
  const productPanel = document.querySelector('.product-panel');
  const chooseProduct = (key, focus = false) => {
    const data = productData[key];
    if (!data || !productPanel) return;
    productLab?.classList.remove('is-changing');
    void productLab?.offsetWidth;
    productLab?.classList.add('is-changing');
    window.setTimeout(() => productLab?.classList.remove('is-changing'), 260);
    if (productVisual) productVisual.style.backgroundImage = `url("${data.image}")`;
    productPanel.querySelector('[data-product-label]').textContent = data.label;
    productPanel.querySelector('[data-product-title]').textContent = data.title;
    productPanel.querySelector('[data-product-description]').textContent = data.description;
    const link = productPanel.querySelector('[data-product-link]');
    if (link) link.href = data.link;
    productButtons.forEach((button) => {
      const selected = button.dataset.product === key;
      button.setAttribute('aria-selected', String(selected));
      button.setAttribute('tabindex', selected ? '0' : '-1');
    });
    if (focus) document.querySelector(`[data-product="${key}"]`)?.focus();
  };
  const productKeys = productButtons.map((button) => button.dataset.product);
  productButtons.forEach((button, index) => {
    button.addEventListener('click', () => chooseProduct(button.dataset.product, true));
    button.addEventListener('pointerenter', () => chooseProduct(button.dataset.product));
    button.addEventListener('keydown', (event) => {
      let next = -1;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % productKeys.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + productKeys.length) % productKeys.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = productKeys.length - 1;
      if (next >= 0) { event.preventDefault(); chooseProduct(productKeys[next], true); }
    });
  });
  chooseProduct(productKeys[0]);

  const motionTabs = [...document.querySelectorAll('[data-motion-tab]')];
  const motionPanel = document.querySelector('.motion-panel');
  const chooseMotion = (index, focus = false) => {
    const data = motionData[index];
    if (!data || !motionPanel) return;
    motionPanel.classList.remove('is-changing');
    void motionPanel.offsetWidth;
    motionPanel.classList.add('is-changing');
    window.setTimeout(() => motionPanel.classList.remove('is-changing'), 260);
    const art = motionPanel.querySelector('[data-motion-art]');
    if (art) art.style.backgroundImage = `url("${data.image}")`;
    motionPanel.querySelector('[data-motion-label]').textContent = data.label;
    motionPanel.querySelector('[data-motion-title]').textContent = data.title;
    motionPanel.querySelector('[data-motion-description]').textContent = data.description;
    motionPanel.querySelector('[data-motion-current]').textContent = String(index + 1).padStart(2, '0');
    const points = motionPanel.querySelector('[data-motion-points]');
    if (points) points.innerHTML = data.points.map((point) => `<li>${point}</li>`).join('');
    motionTabs.forEach((tab, tabIndex) => {
      tab.setAttribute('aria-selected', String(tabIndex === index));
      tab.setAttribute('tabindex', tabIndex === index ? '0' : '-1');
    });
    if (focus) motionTabs[index]?.focus();
  };
  motionTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => chooseMotion(index, true));
    tab.addEventListener('keydown', (event) => {
      let next = -1;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % motionTabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + motionTabs.length) % motionTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = motionTabs.length - 1;
      if (next >= 0) { event.preventDefault(); chooseMotion(next, true); }
    });
  });
  chooseMotion(0);

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
})();
