(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reducedMotion && 'IntersectionObserver' in window) {
    root.dataset.motion = 'on';
  }

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const backToTop = document.querySelector('[data-back-to-top]');

  const syncScrollState = () => {
    const scrolled = window.scrollY > 32;
    header?.classList.toggle('is-scrolled', scrolled);
    backToTop?.classList.toggle('is-visible', window.scrollY > 640);
  };

  syncScrollState();
  window.addEventListener('scroll', syncScrollState, { passive: true });

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    header?.classList.toggle('menu-open', open);
    menuButton.querySelector('.sr-only').textContent = open ? '关闭导航' : '打开导航';
  });

  nav?.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    menuButton?.setAttribute('aria-expanded', 'false');
    header?.classList.remove('menu-open');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    menuButton?.setAttribute('aria-expanded', 'false');
    header?.classList.remove('menu-open');
  });

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  const scenes = [
    {
      image: 'assets/source/banner01.jpg',
      position: 'center',
      label: 'SCENE 01 · HERO',
      title: '先让用户感到“这是风电”',
      description: '真实设备占据画面主体，品牌主张压在视觉中心，数字指标放在视线落点之后。行业识别、情绪和证据在一屏内分层完成。',
      points: ['一个画面只保留一个主判断', '主标题使用 HTML，不烧进图片', '用数字背书，但必须标明来源和时间']
    },
    {
      image: 'assets/source/solution-microgrid.jpg',
      position: 'center',
      label: 'SCENE 02 · SOLUTION',
      title: '按任务分流，而不是按术语劝退',
      description: '商业发电、微电网、离网通讯和新能源投资对应四类用户意图。中心能力稳定，周围入口随场景分支，降低第一次访问的理解成本。',
      points: ['场景名称使用客户语言', '每个入口对应独立证据页', '四至六个分支最适合矩阵表达']
    },
    {
      image: 'assets/source/product-fd56.png',
      position: 'center',
      label: 'SCENE 03 · PRODUCT',
      title: '让型号列表与应用画面同步',
      description: '产品条带承担快速比较，整屏背景承担场景联想。视觉变化会强化型号记忆，但参数、选型条件和详情链接仍要保持稳定可读。',
      points: ['列表位置不随换景跳动', '触摸和键盘也能切换', '重要参数不能藏在 hover 中']
    },
    {
      image: 'assets/source/service-bg.jpg',
      position: 'center',
      label: 'SCENE 04 · SERVICE',
      title: '在成交前回答交付焦虑',
      description: '售前的资源评估与微观选址、售后的运维响应，被放在产品之后，正好承接用户从“想要”进入“能否落地”的判断。',
      points: ['售前与售后职责分开', '响应承诺要说明适用范围', '移动端不能隐藏关键服务文案']
    },
    {
      image: 'assets/source/banner04.jpg',
      position: 'center',
      label: 'SCENE 05 · TRUST',
      title: '把品牌印象落到资质证据',
      description: '公司入口、发展历程、荣誉文化与认证标识在最后出现。它们不是开场口号，而是对方案和产品主张的收束与验证。',
      points: ['认证名称链接到可核验详情', '证书标明主体与有效期', 'Logo 墙不能替代文字说明']
    }
  ];

  const sceneLab = document.querySelector('[data-scene-lab]');
  const sceneTabs = [...document.querySelectorAll('[data-scene]')];

  const selectScene = (index, focus = false) => {
    const scene = scenes[index];
    if (!sceneLab || !scene) return;

    const stage = sceneLab.querySelector('.scene-stage');
    const image = sceneLab.querySelector('[data-scene-image]');
    stage?.classList.add('is-changing');

    window.setTimeout(() => {
      image.style.backgroundImage = `url("${scene.image}")`;
      image.style.backgroundPosition = scene.position;
      sceneLab.querySelector('[data-scene-label]').textContent = scene.label;
      sceneLab.querySelector('[data-scene-title]').textContent = scene.title;
      sceneLab.querySelector('[data-scene-description]').textContent = scene.description;
      sceneLab.querySelector('[data-scene-points]').innerHTML = scene.points.map((point) => `<li>${point}</li>`).join('');
      sceneLab.querySelector('[data-scene-current]').textContent = String(index + 1).padStart(2, '0');
      stage?.classList.remove('is-changing');
    }, reducedMotion ? 0 : 160);

    sceneTabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    if (focus) sceneTabs[index]?.focus();
  };

  sceneTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectScene(index));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % sceneTabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + sceneTabs.length) % sceneTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = sceneTabs.length - 1;
      selectScene(next, true);
    });
  });

  const products = {
    fd56: {
      image: 'assets/source/product-fd56.png',
      label: 'PRODUCT SERIES · 01',
      title: 'FD56 系列',
      description: '将型号与真实应用图绑定，让用户先形成场景记忆，再进入功率、风轮直径和环境条件等可比较参数。'
    },
    fd42: {
      image: 'assets/source/product-fd42.jpg',
      label: 'PRODUCT SERIES · 02',
      title: 'FD42 系列',
      description: '相邻型号使用相同构图和固定切换区域，可以减少视觉跳动。背景负责差异印象，结构化规格负责理性比较。'
    },
    fd32: {
      image: 'assets/source/product-fd32.jpg',
      label: 'PRODUCT SERIES · 03',
      title: 'FD32 系列',
      description: '当产品数量继续增加时，首屏只呈现代表系列，其余型号进入产品中心；不要让整屏条带变成过窄、难点击的入口。'
    }
  };

  const productLab = document.querySelector('[data-product-lab]');
  const productTabs = [...document.querySelectorAll('[data-product]')];

  const selectProduct = (key, focus = false) => {
    const product = products[key];
    if (!productLab || !product) return;

    productLab.classList.add('is-changing');
    window.setTimeout(() => {
      productLab.querySelector('[data-product-visual]').style.backgroundImage = `url("${product.image}")`;
      productLab.querySelector('[data-product-label]').textContent = product.label;
      productLab.querySelector('[data-product-title]').textContent = product.title;
      productLab.querySelector('[data-product-description]').textContent = product.description;
      productLab.classList.remove('is-changing');
    }, reducedMotion ? 0 : 160);

    productTabs.forEach((tab) => {
      const selected = tab.dataset.product === key;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    if (focus) productTabs.find((tab) => tab.dataset.product === key)?.focus();
  };

  productTabs.forEach((tab, index) => {
    const activate = () => selectProduct(tab.dataset.product);
    tab.addEventListener('click', activate);
    tab.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') activate();
    });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % productTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + productTabs.length) % productTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = productTabs.length - 1;
      selectProduct(productTabs[next].dataset.product, true);
    });
  });

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });

    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  }

  root.dataset.ready = 'true';
})();
