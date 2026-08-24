(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion && 'IntersectionObserver' in window) root.dataset.motion = 'on';

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const topButton = document.querySelector('[data-back-to-top]');

  const syncScrollState = () => {
    const scrolled = window.scrollY > 30;
    header?.classList.toggle('is-scrolled', scrolled);
    topButton?.classList.toggle('is-visible', window.scrollY > 650);
  };
  syncScrollState();
  window.addEventListener('scroll', syncScrollState, { passive: true });

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    header?.classList.toggle('menu-open', open);
    const label = menuButton.querySelector('.sr-only');
    if (label) label.textContent = open ? '关闭导航' : '打开导航';
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
  topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  const timelineData = [
    { image: 'assets/source/hero-lake.jpg', position: 'center', label: 'CHAPTER 01 · HERO', title: '先让用户相信绿色未来', description: '自然湖泊与白色大字把品牌使命置于第一视线，技术、产品和企业数字随后出现。', points: ['场景先于规格', '主张写在 HTML 中', '轮播不应成为唯一入口'] },
    { image: 'assets/source/partner-01.png', position: 'center', label: 'CHAPTER 02 · ABOUT', title: '让创始来源成为信任起点', description: '清华大学成果转化、专家发起和多年研发经历被放在关于区，回答“为什么是你”。', points: ['来源需要可链接', '团队事实不要夸大', 'Logo 墙只是辅助证据'] },
    { image: 'assets/source/video-bg.png', position: 'center', label: 'CHAPTER 03 · VIDEO', title: '把生物制造变成一段可感知的过程', description: '视频章节负责把看不见的微生物、发酵和制造体系变成视觉节奏，但不应阻挡正文理解。', points: ['默认静音', '提供 poster 与暂停', '减少动效时保留内容'] },
    { image: 'assets/source/core-bg.png', position: 'center', label: 'CHAPTER 04 · CORE PRODUCT', title: '先解释材料，再谈产品', description: 'PHA 的定义、自然来源和低碳属性先被翻译成易懂价值，之后才进入产品与应用。', points: ['术语先翻译', '原站数字标为自述', '技术图提供替代文本'] },
    { image: 'assets/source/strategy-bg.jpg', position: 'center', label: 'CHAPTER 05 · 4P STRATEGY', title: '四层业务共享同一个词根', description: 'PHAmily、PHAbrary、PHAdustry、PHA Life 形成一条从材料组合到生活方式的业务链。', points: ['统一命名降低记忆成本', '每层必须有用户任务', '中心能力不能被口号替代'] },
    { image: 'assets/source/manufacturing-bg.jpg', position: 'center', label: 'CHAPTER 06 · MANUFACTURING', title: '用四个词压缩产线复杂度', description: '简易、节能低碳、高效、非粮四张卡片把工艺优势拆成可扫描的判断。', points: ['一张卡一个判断', '数字写出口径', '优势要有证据页'] },
    { image: 'assets/source/product-pb3000-hover.png', position: 'center', label: 'CHAPTER 07 · PRODUCTS', title: '让品牌叙事落到可采购产品', description: 'PB3000G、PB3430G、PV3000G 连接材料结构与采购动作，给故事一个可以点击的终点。', points: ['名称与规格同屏', '图片切换不隐藏信息', '详情入口清晰'] },
    { image: 'assets/source/news-01.jpg', position: 'center', label: 'CHAPTER 08 · NEWS', title: '用日期证明品牌仍在发生', description: '大会、认证、ESG、合作和科研动态构成持续更新的证据，不让首页停在一条静态宣言。', points: ['标题必须有来源', '日期是可信度组件', '新闻数量不等于深度'] },
    { image: 'assets/source/footer-bg.jpg', position: 'center', label: 'CHAPTER 09 · CONTACT', title: '把阅读转成下一步行动', description: '页脚、联系方式、语言入口和备案信息收束体验；生产项目必须把真实联系渠道放到这一层。', points: ['不生成虚假联系方式', '移动端保持触控尺寸', '返回顶部要可访问'] }
  ];

  const timelineLab = document.querySelector('[data-timeline-lab]');
  const timelineTabs = [...document.querySelectorAll('[data-timeline]')];
  const chooseTimeline = (index, focus = false) => {
    const data = timelineData[index];
    if (!timelineLab || !data) return;
    const panel = timelineLab.querySelector('.timeline-panel');
    const art = timelineLab.querySelector('[data-timeline-art]');
    panel?.classList.add('is-changing');
    window.setTimeout(() => {
      art.style.backgroundImage = `url("${data.image}")`;
      art.style.backgroundPosition = data.position;
      timelineLab.querySelector('[data-timeline-label]').textContent = data.label;
      timelineLab.querySelector('[data-timeline-title]').textContent = data.title;
      timelineLab.querySelector('[data-timeline-description]').textContent = data.description;
      timelineLab.querySelector('[data-timeline-points]').innerHTML = data.points.map((point) => `<li>${point}</li>`).join('');
      timelineLab.querySelector('[data-timeline-current]').textContent = String(index + 1).padStart(2, '0');
      panel?.classList.remove('is-changing');
    }, reducedMotion ? 0 : 160);
    timelineTabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    if (focus) timelineTabs[index]?.focus();
  };
  timelineTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => chooseTimeline(index));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % timelineTabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + timelineTabs.length) % timelineTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = timelineTabs.length - 1;
      chooseTimeline(next, true);
    });
  });

  const products = {
    pb3000: { image: 'assets/source/product-pb3000-front.png', label: 'PRODUCT 01 · P(3HB)', title: 'PB3000G', description: '产品卡片采用“规格短标签 + 材料正面图 + 详情入口”的三层结构，让科研采购者可以快速确认自己看的是什么。' },
    pb3430: { image: 'assets/source/product-pb3430-front.png', label: 'PRODUCT 02 · P(3HB-co-4HB)', title: 'PB3430G', description: '共聚比例直接进入卡片副标题，用户不需要先打开详情页才能完成第一轮材料筛选。' },
    pv3000: { image: 'assets/source/product-pv3000-front.png', label: 'PRODUCT 03 · P(3HB-co-3HV)', title: 'PV3000G', description: '当系列数量较少时，三张可比较卡片足以承接采购；系列增加后应切换到有筛选和规格表的产品中心。' }
  };
  const productLab = document.querySelector('[data-product-lab]');
  const productTabs = [...document.querySelectorAll('[data-product]')];
  const chooseProduct = (key, focus = false) => {
    const data = products[key];
    if (!productLab || !data) return;
    productLab.classList.add('is-changing');
    window.setTimeout(() => {
      productLab.querySelector('[data-product-visual]').style.backgroundImage = `url("${data.image}")`;
      productLab.querySelector('[data-product-label]').textContent = data.label;
      productLab.querySelector('[data-product-title]').textContent = data.title;
      productLab.querySelector('[data-product-description]').textContent = data.description;
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
    const activate = () => chooseProduct(tab.dataset.product);
    tab.addEventListener('click', activate);
    tab.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') activate(); });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % productTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + productTabs.length) % productTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = productTabs.length - 1;
      chooseProduct(productTabs[next].dataset.product, true);
    });
  });

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: .08, rootMargin: '0px 0px -40px' });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  }
  root.dataset.ready = 'true';
})();
