# 晶华金属钙业素材归档

来源首页：[https://cn.btjhcm.com/](https://cn.btjhcm.com/)；归档时间：2026-08-24（Asia/Shanghai）。

## 语义化素材

| 文件 | 页面角色 | 原站来源/说明 |
| --- | --- | --- |
| `home.html` | 中文首页 DOM 快照 | 原站首页；已移除 51.la 统计加载器，仅保留研究语义 |
| `images/logo.svg` | 头部 Logo | `jhjs0307/uploads/20240307/6e959...svg` |
| `images/footer-logo.svg` | 页脚 Logo | `jhjs0307/uploads/20240309/1e8a...svg` |
| `images/hero-factory.jpg` | 桌面 Hero/工厂航拍 | `20240307/d48b...jpg` |
| `images/hero-mobile.jpg` | 移动 Hero 静态图 | `20240418/92f...jpg` |
| `images/hero-factory.mp4` | 原站 Hero 视频 | `20240312/491355...mp4` |
| `images/product-calcium.jpg` | 金属钙产品图 | `20240307/ee7f...jpg` |
| `images/product-alloy.jpg` | 钙系合金产品图 | `20240417/4b8e...jpg` |
| `images/application-*.jpg` | 四类行业应用图片 | 钢铁、有色金属、石化、电池卡片素材 |
| `images/icon-*.svg` | 行业应用图标 | 原站应用卡内嵌图标 |
| `images/cta-expected.jpg` | 制造能力背景 | 原站“超出您预期的产品”模块 |
| `images/factory-gallery-*.jpg` | 工厂图组 | 原站“创新型制造工厂”轮播 |
| `images/news-*.jpg` | 新闻图片 | 供应商选择、钙氧电池文章 |
| `images/cta-careers.jpg` | 招聘 CTA 背景 | 原站职业入口 |
| `images/float-*.svg` | 电话/联系/返回顶部图标 | 原站右侧悬浮组件 |

## CSS / JS

`main.css`、`share.min.css`、`jquery.fancybox.min.css`、`reset.css`、`bootstrap.min.css`、`swiper-3.4.2.min.css`、`animate.css`、`font.css`、`fonts.css` 与 `iconfont*.css` 为页面样式和字体依赖；`main.js`、`jquery-3.7.0.min.js`、`swiper.jquery.min.js`、`swiper.animate1.0.3.min.js`、`wow.js`、`bootstrap.min.js`、`jquery.share.min.js`、`social-share.min.js`、`layer.js`、`ksbm.js`、`jquery.fancybox.min.js`、`jquery.waypoints.min.js`、`jquery.countup.min.js`、`jquery.SuperSlide.2.1.3.js`、`jquery.scrollLoading.js`、`gsap.min.js`、`ScrollTrigger.min.js` 为公开首页引用或同源依赖。完整公开 CDN 与字体路径保留在 `original/`。

## 截图与清理边界

`original-home-desktop.png` 与 `original-home-mobile.png` 是原站首页的 1440×900、390×844 观察截图；`case-page-*.png` 是本案例页的多尺寸验收截图。

- `home.html` 是研究快照，不是生产模板。它保留公开版权/备案文字，并将 51.la 统计脚本替换为本地注释，避免打开归档时向第三方发送数据。
- 原站使用 `user-scalable=no`、`javascript:;` 空链接、Swiper/WOW/GSAP 等多库和 autoplay 视频。案例页只提炼信息架构，并补充键盘、焦点、缩放、poster 与 reduced-motion 规则。
- 原始资源包含公开页面字体、视频、深层依赖与 CDN 文件，保留它们是为了复核来源；生产项目需按授权、隐私、安全和性能要求重新制作或替换。
