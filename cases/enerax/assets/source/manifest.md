# Enerax 归档素材清单

## 来源

- 观察页面：[https://www.enerax.cn/](https://www.enerax.cn/)
- 资源主机：`https://cloud-1251007531.bcdn8.com/nengyx0812/`
- 页面快照与截图使用了带 `?x=1` 的只读请求以绕过本次观察时裸域的协议/WAF 限制；查询参数不是原始来源 URL 的一部分。
- 截图由本地无头 Chromium 生成：`original-home-desktop.png` 为 1440×900，`original-home-mobile.png` 为 390×844。

## 清理与权利边界

- `home.html` 是公开首页的研究快照，已移除 Baidu `_hmt` 与 CNZZ 统计加载器，避免离线打开继续请求第三方统计；清理位置保留 HTML 注释。
- 归档素材来自公开页面，仅用于内部研究、设计复盘和 AI 上下文。图片、Logo、字体、脚本和视频未授予生产项目使用权；上线相似项目时应取得授权或重新制作。
- 原站自述数字（6+、50+、40%+、100+、900+）没有在本仓库做第三方核验。

## 文件映射

| 文件 | 用途 |
| --- | --- |
| `home.html` | 首页 DOM、导航、产品分类、应用、新闻与统计结构 |
| `main.css` | 原站主样式、vw 根字号、断点、Hero/卡片/按钮样式 |
| `main.js` | sticky、移动导航、tabs、Swiper、计数器、表单与历史交互 |
| `more.js` | GSAP、ScrollTrigger、SplitType、hover 和滚动文字动效 |
| `splitType.js` | 文字拆分依赖 |
| `jquery.SuperSlide.2.1.3.js` | SuperSlide 依赖 |
| `ksbm.js` | 表单/询盘相关依赖 |
| `original-home-desktop.png` | 原站桌面首屏，1440×900 |
| `original-home-mobile.png` | 原站移动首屏，390×844 |
| `case-page-desktop.png` | 本案例页桌面 QA 截图，1440×900（非原站素材） |
| `case-page-mobile.png` | 本案例页移动 QA 截图，390×844（非原站素材） |
| `images/logo-*.svg` | 深/浅色 Logo |
| `images/hero-*.{jpg,png}` | Hero 设备照片与视频 poster |
| `images/product-*.png` | 产品区代表性设备图 |
| `images/app-*.png`、`images/application-icons/` | 行业应用图与导航图标 |
| `images/mission-bg.jpg`、`images/stats-bg.jpg` | 使命与能力数字背景 |
| `images/news-*` | 首页新闻卡片图 |

## 未下载的大文件

首页引用了一个 Hero 视频：

`https://cloud-1251007531.bcdn8.com/nengyx0812/uploads/20260327/866fedd79aa17d4332fa4bc05ef1f2e1.mp4`

本次没有把视频复制进仓库，以控制案例体积；使用 `hero-poster.png` 与 `hero-photo.jpg` 保留视觉分析所需的静态证据。
