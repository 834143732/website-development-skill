# PHABuilder 原站资源清单

- 来源站点：<https://www.phabuilder.com/>
- 观察/下载日期：2026-08-23（Asia/Shanghai）
- 用途：内部网站分析、视觉复盘与 AI 上下文
- 权利说明：文件来自公开站点，不代表本仓库拥有商用、再发布或衍生制作权。生产项目必须取得授权或替换为客户自有/可商用素材。

## 获取方式与清理

直接使用命令行 GET 首页时观察到 403；本次使用浏览器同源只读 `fetch(location.href)` 获取页面 HTML，再保存为 `home.html`。归档快照中移除了 51.la 与 CNZZ 的分析脚本初始化和站点 ID，避免在本地打开快照时继续发起站点统计请求。其余 HTML 仍是观察时点的公开结构快照。

## 页面、样式与脚本

| 本地文件 | 原始 URL | 研究用途 |
| --- | --- | --- |
| `home.html` | `https://www.phabuilder.com/` | 导航、9 个全屏章节、公开文案、视频/产品/新闻结构 |
| `index.css` | `https://www.phabuilder.com/assets/addons/cms/frontend/css/index.css` | 头部、Hero、全屏章节、卡片、浮层、产品和新闻样式 |
| `media.css` | `https://www.phabuilder.com/assets/addons/cms/frontend/css/media.css` | 990px、767px、500px 等响应式适配 |
| `index.js` | `https://www.phabuilder.com/assets/addons/cms/frontend/js/index.js` | 手机导航、搜索、返回顶部、Swiper、WOW 与章节初始化 |
| `ksbm.js` | `https://www.phabuilder.com/assets/addons/cms/frontend/js/ksbm.js` | 原站表单/验证工具依赖 |

## 背景、Logo 与图标

| 本地文件 | 原始 URL | 研究用途 |
| --- | --- | --- |
| `logo.svg` | `https://imgs-data-brwq.bcdn8.com/weigou0520/uploads/20220520/3ae0608fcbd3b08d374ee1d885c79ac3.svg` | 微构工场 Logo |
| `hero-lake.jpg` | `https://imgs-data-brwq.bcdn8.com/weigou0520/uploads/20220521/cafb7f33471328409471d56d1804deb0.jpg` | Hero 湖泊/森林场景 |
| `video-bg.png` | `https://www.phabuilder.com/assets/addons/cms/frontend/img/bg0529.png` | 视频章节背景 |
| `core-bg.png` | `https://www.phabuilder.com/assets/addons/cms/frontend/img/bg05291.png` | 核心产品背景 |
| `strategy-bg.jpg` | `https://www.phabuilder.com/assets/addons/cms/frontend/img/bg10.jpg` | 4P 产业战略背景 |
| `manufacturing-bg.jpg` | `https://www.phabuilder.com/assets/addons/cms/frontend/img/bg11.jpg` | 生物制造背景 |
| `footer-bg.jpg` | `https://www.phabuilder.com/assets/addons/cms/frontend/img/bg6.jpg` | 页脚背景 |
| `shop.svg`、`search.svg`、`language.svg`、`email.svg` | `/assets/addons/cms/frontend/img/` 下对应文件 | 原站导航与联系图标 |

## 业务、产品与内容图片

| 本地文件 | 原始 URL / 对应内容 |
| --- | --- |
| `core-pha-diagram.png` | `uploads/20240529/42f4680231f86a87fdce7f05a7377481.png`，PHA 生物制造与应用图 |
| `strategy-phamily.svg`、`strategy-phabrary.svg`、`strategy-phadustry.svg`、`strategy-phalife.svg` | 4P 战略四个图标 |
| `manufacturing-simple.svg`、`manufacturing-lowcarbon.svg`、`manufacturing-efficient.svg`、`manufacturing-nongrain.svg` | 生物制造四项优势图标 |
| `product-pb3000-front.png`、`product-pb3000-hover.png` | PB3000G 正面图与 hover 图 |
| `product-pb3430-front.png`、`product-pb3430-hover.png` | PB3430G 正面图与 hover 图 |
| `product-pv3000-front.png`、`product-pv3000-hover.png` | PV3000G 正面图与 hover 图 |
| `news-01.jpg` ~ `news-04.jpg` | PHA 大会、工信部产品、绿色低碳创新与科研新闻示例图 |
| `partner-01.png` ~ `partner-04.png` | 关于区产业合作伙伴图集示例 |

原始内容中的产品、新闻和图标资源来自 `imgs-data-brwq.bcdn8.com` 的对应上传路径；完整路径可在 `home.html` 中复核。

## 视频与第三方资源

原站视频 URL 为 `https://imgs-data-brwq.bcdn8.com/weigou0520/uploads/20240601/82af769e0f6bb6f96130a0783e4eab1d2.mp4`，本次未下载大体积视频，仅在 `home.html` 和 README 中记录。原站还加载外部字体、Bootstrap、Swiper、WOW、Fancybox、分享和统计资源；案例页没有引用这些外部运行时。

## 视觉证据

| 本地文件 | 生成方式 | 研究用途 |
| --- | --- | --- |
| `original-home-desktop.png` | 2026-08-23 使用无头 Chrome 以 1440 × 900 访问原站 | 核对白色导航、自然 Hero、章节分页与浮层 |
| `original-home-mobile.png` | 2026-08-23 使用 Chrome DevTools 模拟 390 × 844 | 核对移动菜单、Hero 裁切和全屏插件关闭后的自然滚动 |

## 使用边界

1. `home.html` 是观察时点快照，不能代表之后站点的内容或实现。
2. PHA 降解、成本、能耗、产率、生产时间和组合数量等数字均为原站自述，未做第三方核验。
3. 案例页仅引用部分图片作内部说明；客户生产项目应重绘、取得授权或替换为可商用素材。
4. 原站 CSS/JS 仅用于分析实现，不能直接拼接进新项目。
