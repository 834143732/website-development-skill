# 梅花集团归档素材清单

## 来源

- 中文根域：[https://www.meihua.group/](https://www.meihua.group/)
- 英文变体：[https://english.meihua.group/](https://english.meihua.group/)
- 资源主机：页面自身的 `www.meihua.group` / `english.meihua.group`，路径主要位于 `/Public/Cn/`、`/Public/En/` 与 `/Public/Uploads/`。
- 中文 HTML 使用了带 `?x=1` 的只读请求以提高本次抓取成功率；查询参数不是原站内容的一部分。英文快照使用根路径请求。
- `home.html` 为中文根域视觉与 DOM 证据；`home-en.html` 为英文子域结构对照。原站在抓取时的页面内容、脚本和资源可能继续变化。
- 原站首屏截图由本地 Chromium 生成：`original-home-desktop.png` 为 1440×900，`original-home-mobile.png` 为 390×844；两张图都观察到中文根域首屏。

## 清理与权利边界

- 两份 HTML 快照均删除 WowPop、Google Analytics 与 Baidu 统计加载块，替换为 HTML 清理注释，避免离线打开继续请求第三方服务；页面主体、公开导航、产品、数字和联系方式结构保留。
- `user-scalable=no` 等原站事实没有从快照中伪装成推荐实现；案例页的 viewport 允许缩放。
- 归档素材来自公开页面，仅用于内部研究、设计复盘和 AI 上下文。图片、Logo、字体、脚本、Lottie 与视频未授予生产项目使用权；上线相似项目时应取得授权或重新制作。
- 20 年、150 个国家/地区、30 亿人口是原站公开自述，未在本仓库做年报、审计或第三方核验。

## 页面与代码映射

| 文件 | 用途 |
| --- | --- |
| `home.html` | 中文根域首页 DOM、导航、Hero、7 类产品、品质数字、生物制造与页脚结构 |
| `home-en.html` | 英文子域首页 DOM 对照 |
| `main.css` / `media.css` | 中文首页主样式与媒体查询 |
| `main-en.css` / `media-en.css` | 英文首页主样式与媒体查询变体 |
| `public-cn.css` / `public-en.css` | 中英文公共样式 |
| `iconfont-cn.css` / `iconfont.css` | 中英文图标字体声明 |
| `Yongsy-cn.js` / `Yongsy.js` | 中英文公共前端依赖 |
| `jquery-cn.min.js` / `jquery.min.js` | 中英文 jQuery 依赖 |
| `layer-cn.js` / `layer.js` | 中英文 Layer 弹层依赖 |
| `public-cn.js` / `public-en.js` | 中英文站点公共脚本 |
| `base-v3.0-cn.min.js` / `base-v3.0-en.min.js` | 中英文压缩基础运行时，包含轮播/滚动等历史依赖 |
| `common-cn.js` / `common-en.js` | 中英文首页公共初始化与业务交互 |
| `lottie-cn.min.js` / `lottie.min.js` | 中英文 Lottie 运行时 |
| `data-cn.json` / `data.json` | 中英文生物制造动画数据 |
| `favicon.png` | 页面 favicon |
| `original-home-desktop.png` | 根域中文原站桌面首屏，1440×900 |
| `original-home-mobile.png` | 根域中文原站移动首屏，390×844 |
| `case-page-desktop.png` | 本案例页桌面 QA 截图，1440×900（非原站素材） |
| `case-page-mobile.png` | 本案例页移动 QA 截图，390×844（非原站素材） |
| `images/original/En/` | 英文路径下的图片/SVG 原始层级归档 |
| `images/original/Uploads/` | 公共上传图片/SVG 原始层级归档 |

## 研究页使用的本地别名

| 别名 | 原始资源/用途 |
| --- | --- |
| `images/logo-dark.svg` | `/Public/Uploads/uploadfile/images/20241024/a0logo011.svg`，深色导航 Logo |
| `images/logo-light.svg` | `/Public/Uploads/uploadfile/images/20241024/a0logo01-507.svg`，Hero/深色背景 Logo |
| `images/logo-footer.svg` | `/Public/Uploads/uploadfile/images/20241024/footicon0.svg`，页脚 Logo |
| `images/hero-family.jpg` | `a1banenrpc01.jpg`，家庭烹饪桌面 Hero |
| `images/hero-food.jpg` | `a1banenrpc02.jpg`，家庭/食物第二张 Hero |
| `images/hero-family-mobile.jpg` / `hero-food-mobile.jpg` | `a1banenrph01.jpg` / `a1banenrph02.jpg`，移动裁切 Hero |
| `images/product-*.jpg` | `a1img03.jpg`、`a1img04-18.jpg`、`a1img06.jpg`、`a2img01.jpg`、`a2img03.jpg`、`a2img04-376.jpg`、`b2img05.jpg` 等产品/能力图 |
| `images/quality-bg.png` | `/Public/En/images/a1_img08.png`，品质数字背景 |
| `images/bio-center.jpg` | `/Public/En/images/img001.jpg`，生物制造中心视觉 |
| `images/applications-ring.jpg` | `Ashouyegushilianpeitu.jpg`，应用环视觉 |
| `images/bio-works.svg` / `bio-line.svg` / `bio-cloud-*.svg` | `/Public/En/images/a1_works.svg`、`a1_line.svg`、`a1_bg02.svg` 等生物制造装饰 |

别名只是为了让本案例页离线可读；原始 URL 层级仍保留在 `images/original/`，便于回查。

## 未下载的大文件

首页引用的 WebM 视频体积较大，本次保留 HTML 中的引用并使用静态图片完成案例页：

- `/Public/Uploads/uploadfile/files/20250221/meihua2.21.webm`
- `/Public/Uploads/uploadfile/files/20241125/02.webm`
- `/Public/En/images/02.webm`
- `/Public/Cn/images/02.webm`

如果未来需要对视频做性能或剪辑研究，应单独取得下载与使用授权，并记录文件大小、编码、poster、字幕和加载策略。
