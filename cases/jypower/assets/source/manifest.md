# jypower.cn source archive manifest

## Observation

- Source: [https://www.jypower.cn/](https://www.jypower.cn/)
- Captured: 2026-08-23, Asia/Shanghai
- Scope: public Chinese homepage HTML, directly referenced CSS/JS/images/fonts, one Hero MP4, and desktop/mobile screenshots. No login, backend, subscription submission, API or third-party verification.
- Download method: direct homepage fetch with `curl -L --http1.1` and a browser-like user agent. The resource archive also preserves same-origin pages referenced by the homepage because the origin/path can be useful when reviewing menu behavior; those pages are not claimed as fully audited.
- `original/` keeps downloaded resources by host and path: `www.jypower.cn`, `s-files.bcdn8.com`, `g-style-js.bcdn8.com`, `at.alicdn.com`, `gstatic.loli.net` and `en.jypower.cn`.

## Cleaning boundary

`home.html` is a research copy of the public source. The footer's CNZZ injection was removed and replaced by a research comment. The public page's historical `javascript:;` float links, `user-scalable=no` viewport, form markup, old libraries and other layout code remain for analysis. They are not recommendations for production.

## Core alias mapping

| Local alias | Observed source role |
| --- | --- |
| `home.html` | Public Chinese homepage DOM snapshot |
| `main.css` / `site-main.css` | `www.jypower.cn/assets/addons/cms/frontend/css/main.css` |
| `reset.css`, `font.css`, `fonts.css`, `bootstrap.min.css` | Shared typography, reset and layout dependencies |
| `swiper-3.4.2.min.css`, `animate.css`, `fancybox.css`, `share.min.css` | Homepage visual/interaction styles |
| `main.js` | `www.jypower.cn/assets/addons/cms/frontend/js/main.js` |
| `more.js`, `splitType.js`, `jquery.SuperSlide.2.1.3.js`, `layui.js` | Same-origin UI, text animation, sliders and form/UI dependencies |
| `jquery-3.7.0.min.js`, `swiper.jquery.min.js`, `swiper.animate1.0.3.min.js` | Core runtime and Hero/application sliders |
| `gsap/gsap.min.js`, `gsap/ScrollTrigger.min.js` | GSAP dependencies retained under `original/` |
| `images/hero-*` | Four Hero source images; the fourth also layers the archived MP4 |
| `images/product-*` | Six product family images |
| `images/application-*` | Four application images |
| `images/service-*` | Order, design, support and join action icons |
| `images/icon-*`, `float-*`, `qr-wechat.png` | Contact and right-rail references |
| `images/logo.svg` | JIYUAN public logo |
| `images/hero-service.mp4` | Public Hero service video, 25 MB class asset |

## Source resource notes

- Origin images and video are served from `s-files.bcdn8.com/jiyuan0515/uploads/`; core CSS/JS dependencies use `g-style-js.bcdn8.com`; icon fonts use Alibaba's `at.alicdn.com`; font slices were captured from `gstatic.loli.net` where available.
- The homepage HTML uses a `CN`/`EN` language switch, with the English route at `en.jypower.cn`. The Chinese root's visible copy and metadata are the basis for this case.
- The homepage includes one explicit Hero MP4 source: `https://s-files.bcdn8.com/jiyuan0515/uploads/20251223/646e4e38e85127f40fd1b41b35e243c2.mp4`.
- The public footer includes a subscription form with email input and a token. No submission was made; the case page does not reproduce a live form.

## Screenshots

- `original-home-desktop.png`: 1440×900 headless browser capture of the public homepage.
- `original-home-mobile.png`: 390×844 headless browser capture of the public homepage.
- `case-page-desktop.png`: generated after local case-page QA at 1440×900.
- `case-page-mobile.png`: generated after local case-page QA at 390×844.

## Rights and reuse

Logo, product photos, Hero images, MP4, fonts, CSS, JavaScript, QR code and public contact details are retained for internal design research, reverse-engineering and AI context only. They do not grant production reuse rights. Obtain permission or recreate the visual system before shipping a new site; recheck all public claims and contact details first.
