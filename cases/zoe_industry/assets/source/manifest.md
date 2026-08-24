# 舟欧工业科技素材归档

来源首页：[https://www.zoe-industry.cn/](https://www.zoe-industry.cn/)；归档时间：2026-08-23（Asia/Shanghai）。

## 语义化素材

| 文件 | 页面角色 | 原站来源/说明 |
| --- | --- | --- |
| `home.html` | 中文首页 DOM 快照 | 原站首页，已移除 51.la 与 Baidu 统计加载器，仅保留研究注释 |
| `images/logo.svg` | Logo | 原站 `assets/addons/cms/frontend/images/logo.svg` |
| `images/hero-mro.jpg` | 工业自动化 Hero | `20240202/e691598832b186430e1d4392535e8739.jpg` |
| `images/hero-us-arms.jpg` | 美国机床解决方案 Hero | `20240117/ce31d5b4f723eeb81eaf02a5121c5332.jpg` |
| `images/hero-cleaning.jpg` | 德国清洁系统 Hero | `20240117/2045970a45ff6e03f74ac9238035161b.jpg` |
| `images/hero-technology.jpg` | 技术/备用 Hero | 原始首页关联图片 |
| `images/arm-*.jpg` | FlexArm 产品小图 | 原站第二张 Hero 的四张产品图 |
| `images/clean-*.jpg` | 德国清洁系统小图 | 原站第三张 Hero 的三张产品图 |
| `images/brand-*.jpg/png` | 品牌 Logo 与 Hero 标识 | 原站品牌中心/幻灯片标识 |
| `images/industry-*.svg` | 12 类行业图标 | 原站服务领域图标 |
| `images/industry-ring.svg` | 行业环装饰 | 原站服务领域中心装饰 |
| `images/about-team.jpg` | 关于我们图像 | 原站关于我们图像 |
| `images/news-*.jpeg/jpg/png` | 新闻卡片 | 原站公司新闻图片 |
| `images/customer-*.jpg` | 客户 Logo 卡 | 原站客户滚动区域 |
| `images/qr-wechat.png` | 微信二维码 | 原站联系区域 |
| `images/icon-*.svg`, `images/float-*.svg` | 联系/浮层图标 | 原站联系与右侧悬浮组件 |

`original-home-desktop.png` 与 `original-home-mobile.png` 是原站首页的 1440×900、390×844 观察截图；`case-page-*.png` 是本案例页在 1440、1180、900、768、640、390 宽度下的验收截图。

## CSS / JS

`main.css`、`reset.css`、`bootstrap.min.css`、`swiper-3.4.2.min.css`、`animate.css`、`font.css`、`iconfont*.css` 为页面样式和图标字体；`main.js`、`jquery-3.7.0.min.js`、`swiper.jquery.min.js`、`swiper.animate1.0.3.min.js`、`wow.js`、`bootstrap.min.js`、`layer.js`、`jquery.fancybox.min.js`、`jquery.waypoints.min.js`、`jquery.countup.min.js`、`jquery.SuperSlide.2.1.3.js`、`ksbm.js` 为公开首页引用或同源依赖。完整 URL 与深层页面资源保留于 `original/`。

## 清理边界

- `home.html` 是研究快照，不是生产模板。它保留原站结构与版权/备案文字，并将 51.la 与 Baidu 统计脚本替换为本地注释，避免打开归档时向第三方发送数据。
- 原站使用 `lang="zh-CN"`、`user-scalable=no`、Swiper/多套旧版脚本和若干 `javascript:;` 链接。案例页仅提炼其信息架构并补充键盘、Escape、焦点、缩放和 reduced-motion 规则。
- 原始资源中包含公开页面的字体、深层页面 HTML 与外部 CDN 文件，保留它们是为了复核来源；新项目应按授权、隐私、安全和性能要求重新制作或替换。
