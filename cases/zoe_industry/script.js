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
  const updateHeader = () => {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  menuToggle?.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  const heroBg = document.querySelector('[data-hero-bg]');
  const heroData = [
    { image: 'hero-mro.jpg' },
    { image: 'hero-us-arms.jpg' },
    { image: 'hero-cleaning.jpg' }
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
        window.setTimeout(() => heroBg.classList.remove('is-changing'), 380);
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
    if (!reducedMotion.matches && heroTabs.length > 1) heroTimer = window.setInterval(() => chooseHero(heroIndex + 1), 5600);
  };
  heroTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => { chooseHero(index); startHeroTimer(); });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? heroTabs.length - 1 : event.key === 'ArrowRight' ? index + 1 : index - 1;
      chooseHero(next, true);
      startHeroTimer();
    });
  });
  reducedMotion.addEventListener?.('change', startHeroTimer);
  chooseHero(0);
  startHeroTimer();

  const productData = {
    encoder: { label: 'FAMILY 01 · SENSE', title: '编码器', image: 'hero-mro.jpg', description: '将旋转、位移和位置反馈放在首层目录，用功能问题替代一长串品牌型号，方便工程师先判断接口、精度和环境等级。', link: 'https://www.zoe-industry.cn/bmqia' },
    pump: { label: 'FAMILY 02 · MOVE', title: '工业泵', image: 'clean-air-system.jpg', description: '把介质、流量、压力和工况作为泵类入口的第一组判断，再将品牌、材质、密封与交期收进详情。', link: 'https://www.zoe-industry.cn/gybe' },
    valve: { label: 'FAMILY 03 · CONTROL', title: '工业阀', image: 'hero-cleaning.jpg', description: '工业阀不只是一张型号表；按介质、动作、连接和安全等级组织信息，才能让采购与工程师使用同一条路径。', link: 'https://www.zoe-industry.cn/gyfa' },
    motor: { label: 'FAMILY 04 · DRIVE', title: '工业电机', image: 'arm-manipulator.jpg', description: '电机入口围绕运动、负载、转速与安装环境展开，再连接驱动器、编码器和替代方案。', link: 'https://www.zoe-industry.cn/gydj' },
    fixture: { label: 'FAMILY 05 · HOLD', title: '工件夹具', image: 'arm-balance.jpg', description: '夹具和机械手解决的是抓取、定位、减负与工件一致性；案例页把它写成工艺动作而不是静态零件。', link: 'https://www.zoe-industry.cn/gyjj' },
    sensor: { label: 'FAMILY 06 · READ', title: '传感器', image: 'hero-us-arms.jpg', description: '传感器以被测对象、环境和输出信号作为筛选轴，帮助工厂从产线结果回到器件。', link: 'https://www.zoe-industry.cn/cgq' },
    electrical: { label: 'FAMILY 07 · CONNECT', title: '电气设备及元件', image: 'brand-center-bg.jpg', description: '电气元件覆盖连接、保护、控制与配电；要用系统角色组织入口，避免把不同责任混进一个品牌墙。', link: 'https://www.zoe-industry.cn/dqsbyj' },
    instrument: { label: 'FAMILY 08 · VERIFY', title: '仪器仪表', image: 'news-ciie.jpeg', description: '仪表是验收和追溯的工具，详情需要说明精度、校准、通讯和现场服务，才会从目录走到采购。', link: 'https://www.zoe-industry.cn/yqyba' },
    mechanical: { label: 'FAMILY 09 · COMPLETE', title: '机械及配件', image: 'about-team.jpg', description: '机械及配件补齐生产线的最后一公里；用工位、尺寸、材料和可替代关系承接零散的备件搜索。', link: 'https://www.zoe-industry.cn/jxjpk' }
  };
  const productStage = document.querySelector('[data-product-stage]');
  const productLabel = document.querySelector('[data-product-label]');
  const productTitle = document.querySelector('[data-product-title]');
  const productDescription = document.querySelector('[data-product-description]');
  const productLink = document.querySelector('[data-product-link]');
  const productTabs = [...document.querySelectorAll('.product-selector [data-product]')];
  let activeProduct = 'encoder';
  const chooseProduct = (key, shouldFocus = false) => {
    const item = productData[key];
    if (!item) return;
    activeProduct = key;
    if (productStage) {
      productStage.classList.remove('is-changing');
      productStage.style.backgroundImage = `url("assets/source/images/${item.image}")`;
      if (!reducedMotion.matches) {
        productStage.classList.add('is-changing');
        window.setTimeout(() => productStage.classList.remove('is-changing'), 380);
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

  const industryData = {
    mining: ['SCENE 01 / MINING', '矿山设备', '矿山设备对耐久、粉尘、振动和远程运维更敏感；行业入口可继续连接传感器、阀和泵的工况筛选。'],
    metallurgy: ['SCENE 02 / METALLURGICAL', '冶金行业', '高温、重载与连续生产是冶金场景的判断轴；让工艺段和安全等级成为询价前的表单字段。'],
    energy: ['SCENE 03 / ENERGY', '能源行业', '能源行业需要长周期稳定和现场服务，首页可用项目阶段、设备类型和备件保障承接深入咨询。'],
    biomedicine: ['SCENE 04 / BIOMEDICINE', '生物医药', '洁净、可追溯与材料兼容性比“工业”大词更重要，内容应将标准与验证证据提前。'],
    machining: ['SCENE 05 / MACHINING', '机械加工', '机加工围绕精度、夹持、检测和刀具工艺组织内容，让夹具、编码器与仪表形成组合入口。'],
    shipping: ['SCENE 06 / SHIPPING', '船舶行业', '船舶行业强调环境耐受、认证与维护窗口，详情页应说明现场条件和可替代件。'],
    logistics: ['SCENE 07 / LOGISTICS', '物流运输', '物流设备需要高频动作与稳定检测，行业页可从输送、分拣、仓储自动化任务下钻。'],
    rail: ['SCENE 08 / RAIL', '轨道交通', '轨交项目需要认证、寿命和批次管理，行业卡应该连接到合规文件和交付周期。'],
    aerospace: ['SCENE 09 / AEROSPACE', '航空航天', '航空航天的入口要强调轻量、可靠和可追溯；不要用泛化的“高端制造”替代证据。'],
    power: ['SCENE 10 / POWER', '电力行业', '电力现场的保护、测量和连续运行要求高，产品页应提供选型边界与服务响应说明。'],
    petrochemical: ['SCENE 11 / PETROCHEMICAL', '石油化工', '防爆、腐蚀和介质兼容是石化场景的第一层筛选，应在行业入口就显示证据类型。'],
    automotive: ['SCENE 12 / AUTOMOTIVE', '汽车制造行业', '汽车制造是官网自述客户行业之一；落地页可继续拆成焊装、涂装、总装、检测和备件等真实任务，再连接编码器、阀、泵和传感器入口。']
  };
  const industryButtons = [...document.querySelectorAll('[data-industry]')];
  const industryTitle = document.querySelector('[data-industry-title]');
  const industryLabel = document.querySelector('[data-industry-label]');
  const industryDescription = document.querySelector('[data-industry-description]');
  const chooseIndustry = (key, shouldFocus = false) => {
    const item = industryData[key];
    if (!item) return;
    if (industryTitle) industryTitle.textContent = item[1];
    if (industryLabel) industryLabel.textContent = item[0];
    if (industryDescription) industryDescription.textContent = item[2];
    industryButtons.forEach((button) => button.setAttribute('aria-selected', String(button.dataset.industry === key)));
    if (shouldFocus) industryButtons.find((button) => button.dataset.industry === key)?.focus();
  };
  industryButtons.forEach((button, index) => {
    button.addEventListener('click', () => chooseIndustry(button.dataset.industry));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? industryButtons.length - 1 : ['ArrowRight', 'ArrowDown'].includes(event.key) ? index + 1 : index - 1;
      chooseIndustry(industryButtons[(next + industryButtons.length) % industryButtons.length].dataset.industry, true);
    });
  });
  chooseIndustry('automotive');

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
    if (!event.target.closest('.contact-rail')) closeContact();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { closeContact(); closeMenu(); }
  });

  const backTop = document.querySelector('[data-back-to-top]');
  const updateBackTop = () => backTop?.classList.toggle('is-visible', window.scrollY > 650);
  updateBackTop();
  window.addEventListener('scroll', updateBackTop, { passive: true });
  backTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' }));
})();
