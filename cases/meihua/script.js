(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  root.dataset.ready = 'true';
  if (!reducedMotion.matches) root.dataset.motion = 'on';

  const header = document.querySelector('[data-header]');
  const topButton = document.querySelector('[data-back-to-top]');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  const contactToggle = document.querySelector('.contact-toggle');
  const contactPanel = document.querySelector('.contact-panel');

  const updateScrollState = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 34);
    topButton?.classList.toggle('is-visible', window.scrollY > 520);
  };
  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  const closeMenu = () => {
    menuToggle?.setAttribute('aria-expanded', 'false');
    header?.classList.remove('menu-open');
  };
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    header?.classList.toggle('menu-open', !open);
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      contactPanel?.classList.remove('is-open');
      contactToggle?.setAttribute('aria-expanded', 'false');
    }
  });
  topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
  contactToggle?.addEventListener('click', () => {
    const open = contactToggle.getAttribute('aria-expanded') === 'true';
    contactToggle.setAttribute('aria-expanded', String(!open));
    contactPanel?.classList.toggle('is-open', !open);
  });

  const heroMedia = document.querySelector('[data-hero-media]');
  const heroButtons = [...document.querySelectorAll('[data-hero]')];
  const chooseHero = (index, focus = false) => {
    heroMedia?.classList.toggle('is-second', index === 0);
    heroButtons.forEach((button, buttonIndex) => {
      button.setAttribute('aria-selected', String(buttonIndex === index));
      button.setAttribute('tabindex', buttonIndex === index ? '0' : '-1');
    });
    if (focus) heroButtons[index]?.focus();
  };
  heroButtons.forEach((button, index) => {
    button.addEventListener('click', () => chooseHero(index, true));
    button.addEventListener('keydown', (event) => {
      const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
      let next = direction ? (index + direction + heroButtons.length) % heroButtons.length : event.key === 'Home' ? 0 : event.key === 'End' ? heroButtons.length - 1 : -1;
      if (next >= 0) { event.preventDefault(); chooseHero(next, true); }
    });
  });
  chooseHero(0);

  const productData = {
    livestock: { image: 'assets/source/images/product-livestock.jpg', label: 'PRODUCT FAMILY 01', title: 'Livestock Nutrition', description: '“Feed better, grow stronger” 将产品类别与结果承诺绑在一起；用户先理解用途，再进入具体氨基酸产品和应用范围。', link: 'https://www.meihua.group/product/livestock-nutrition?tp=11' },
    umami: { image: 'assets/source/images/product-umami.jpg', label: 'PRODUCT FAMILY 02', title: 'Umami Agents', description: '鲜味剂入口用“提升味觉”作为第一层解释，再让详情页承接规格、应用和客户采购条件。', link: 'https://www.meihua.group/product/umami-agents?tp=12' },
    food: { image: 'assets/source/images/product-food.jpg', label: 'PRODUCT FAMILY 03', title: 'Food Ingredients', description: '食品原料把“人类食品的优质原料”放在品类名旁边，用一句结果语言降低专业名词的理解门槛。', link: 'https://www.meihua.group/product/pharmaceutical-raw-materials?tp=13' },
    colloid: { image: 'assets/source/images/product-colloid.jpg', label: 'PRODUCT FAMILY 04', title: 'Colloids & Polysaccharides', description: '胶体多糖的“性能与应用”提示用户，这类产品的选择依据应继续下沉到性能、剂型和适配场景。', link: 'https://www.meihua.group/product/colloidal-polysaccharides?tp=14' },
    health: { image: 'assets/source/images/product-health.jpg', label: 'PRODUCT FAMILY 05', title: 'Livestock Health', description: '动物保健延续从结果出发的命名，先回答“如何保持健康与生产力”，再进入产品和服务。', link: 'https://www.meihua.group/product/livestock-health?tp=15' },
    protein: { image: 'assets/source/images/product-plant-protein.jpg', label: 'PRODUCT FAMILY 06', title: 'Plant-Based Protein', description: '植物基蛋白为动物营养提供植物来源的选择；这类入口适合同时解释来源、功能、合规和供应链边界。', link: 'https://www.meihua.group/product/plant-based-protein-and-others?tp=16' },
    plant: { image: 'assets/source/images/product-plant-nutrition.jpg', label: 'PRODUCT FAMILY 07', title: 'Plant Nutrition', description: '植物营养用“healthy growth”把土地、作物与结果连接起来，让产品平台覆盖从动物到植物的完整闭环。', link: 'https://www.meihua.group/product/plant-nutrition?tp=19' }
  };
  const productButtons = [...document.querySelectorAll('[data-product]')];
  const productStage = document.querySelector('[data-product-stage]');
  const productLab = document.querySelector('[data-product-lab]');
  const productPanel = document.querySelector('.product-panel');
  const chooseProduct = (key, focus = false) => {
    const data = productData[key];
    if (!data || !productPanel) return;
    productStage?.classList.remove('is-changing');
    void productStage?.offsetWidth;
    productStage?.classList.add('is-changing');
    window.setTimeout(() => productStage?.classList.remove('is-changing'), 260);
    if (productStage) productStage.style.backgroundImage = `url("${data.image}")`;
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
    productLab?.setAttribute('data-active-product', key);
  };
  productButtons.forEach((button, index) => {
    button.addEventListener('click', () => chooseProduct(button.dataset.product, true));
    button.addEventListener('pointerenter', () => chooseProduct(button.dataset.product));
    button.addEventListener('keydown', (event) => {
      let next = -1;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % productButtons.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + productButtons.length) % productButtons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = productButtons.length - 1;
      if (next >= 0) { event.preventDefault(); chooseProduct(productButtons[next].dataset.product, true); }
    });
  });
  chooseProduct('livestock');

  const fields = [
    { label: 'FIELD 01 · AMINO ACIDS', title: 'Unlocking the Potential of Renewable Plant-Based Resources', description: '从可再生植物资源出发，把熟悉的氨基酸能力放回原料、生产与健康结果的链条中。' },
    { label: 'FIELD 02 · BIO-BASED CHEMICALS', title: 'Drive production efficiency through technology', description: '生物基化学品需要解释替代什么、效率如何提升、目前处于怎样的产业化阶段。' },
    { label: 'FIELD 03 · DNA SYNTHESIS', title: 'Make biological information easier to use', description: 'DNA 合成是研发方向，不应只作为炫目的名词；页面需要给出平台、合作或验证线索。' },
    { label: 'FIELD 04 · PHARMACEUTICAL INTERMEDIATES', title: 'Build trust at every intermediate step', description: '医药中间体强调合规、质量和可追溯性，详情页应承担更完整的证据密度。' },
    { label: 'FIELD 05 · FUNCTIONAL FOOD INGREDIENTS', title: 'Turn nutrition into useful everyday choices', description: '功能食品成分把科研语言转成饮食与健康选择，既要有亲和力，也要标明适用边界。' },
    { label: 'FIELD 06 · PROTEINS OR PEPTIDES', title: 'Keep expanding the biological toolkit', description: '蛋白质或多肽是平台能力的延展入口，适合用研究方向、应用案例和合作入口承接。' },
    { label: 'FIELD 07 · OTHERS', title: 'Leave room for the next application', description: 'Others 可以保留探索空间，但不能成为没有内容的空白分类；应说明阶段状态或下一步。' }
  ];
  const fieldButtons = [...document.querySelectorAll('[data-field]')];
  const fieldCopy = document.querySelector('.bio-copy');
  const chooseField = (index, focus = false) => {
    const data = fields[index];
    if (!data || !fieldCopy) return;
    fieldCopy.classList.remove('is-changing');
    void fieldCopy.offsetWidth;
    fieldCopy.classList.add('is-changing');
    window.setTimeout(() => fieldCopy.classList.remove('is-changing'), 260);
    fieldCopy.querySelector('[data-field-label]').textContent = data.label;
    fieldCopy.querySelector('[data-field-title]').textContent = data.title;
    fieldCopy.querySelector('[data-field-description]').textContent = data.description;
    fieldButtons.forEach((button, buttonIndex) => {
      button.setAttribute('aria-selected', String(buttonIndex === index));
      button.setAttribute('tabindex', buttonIndex === index ? '0' : '-1');
    });
    if (focus) fieldButtons[index]?.focus();
  };
  fieldButtons.forEach((button, index) => {
    button.addEventListener('click', () => chooseField(index, true));
    button.addEventListener('keydown', (event) => {
      let next = -1;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % fieldButtons.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + fieldButtons.length) % fieldButtons.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = fieldButtons.length - 1;
      if (next >= 0) { event.preventDefault(); chooseField(next, true); }
    });
  });
  chooseField(0);

  const motionData = [
    { image: 'assets/source/images/hero-food.jpg', label: 'CHAPTER 01 · HERO', heading: '先用家庭与食物讲清“为什么”', description: 'Hero 采用淡入切换，桌面端每 10 秒切换一张；可视化圆环与轮播进度同步，图片是主证据，文字保持 HTML 可读。', points: ['图片先定情绪', '标题再给方向', '按钮承接详情'] },
    { image: 'assets/source/images/product-umami.jpg', label: 'CHAPTER 02 · PRODUCT', heading: '让 hover 解释产品，而不是隐藏产品', description: '七类产品卡在桌面端通过 hover 展开，移动端通过 Slick 滑动；名称与场景描述始终应保留在 DOM 中。', points: ['hover 只做增强', '触摸与键盘等价', '详情入口可追踪'] },
    { image: 'assets/source/images/quality-bg.png', label: 'CHAPTER 03 · QUALITY', heading: '让三个数字组成一条证据线', description: 'CountUp 让数字有进入节奏，但动画结束后的静态值、单位与解释才是内容本体。', points: ['时间 / 范围 / 影响', '数字标注口径', '静态值永远可读'] },
    { image: 'assets/source/images/bio-center.jpg', label: 'CHAPTER 04 · BIO MAP', heading: '固定视觉让复杂内容慢下来', description: '原站在滚动进入生物制造区后固定中心动画，并通过 Lottie 进度映射滚动位置；这类效果需要静态 fallback。', points: ['滚动驱动进度', '固定区有边界', '低端设备可降级'] },
    { image: 'assets/source/images/applications-ring.jpg', label: 'CHAPTER 05 · FALLBACK', heading: '任何动画都必须有静态答案', description: '无脚本、慢网、键盘和 reduced-motion 用户仍应看到标题、领域、产品和链接，而不是一片留白。', points: ['poster / alt', 'natural scroll', 'reduced-motion'] }
  ];
  const motionTabs = [...document.querySelectorAll('.motion-tabs [data-motion]')];
  const motionPanel = document.querySelector('.motion-panel');
  const chooseMotion = (index, focus = false) => {
    const data = motionData[index];
    if (!data || !motionPanel) return;
    const art = motionPanel.querySelector('[data-motion-art]');
    art?.classList.remove('is-changing');
    void art?.offsetWidth;
    art?.classList.add('is-changing');
    window.setTimeout(() => art?.classList.remove('is-changing'), 260);
    if (art) art.style.backgroundImage = `url("${data.image}")`;
    motionPanel.querySelector('[data-motion-label]').textContent = data.label;
    motionPanel.querySelector('[data-motion-heading]').textContent = data.heading;
    motionPanel.querySelector('[data-motion-description]').textContent = data.description;
    motionPanel.querySelector('[data-motion-points]').innerHTML = data.points.map((point) => `<li>${point}</li>`).join('');
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
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    }, { threshold: .12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
})();
