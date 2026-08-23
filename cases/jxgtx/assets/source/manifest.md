# jxgtx.com source archive manifest

## Observation

- Source: [https://www.jxgtx.com/](https://www.jxgtx.com/)
- Captured: 2026-08-23, Asia/Shanghai
- Scope: public homepage HTML, directly referenced CSS/JS/images/fonts, and desktop/mobile screenshots. No login, admin, form submission, API, analytics account or third-party verification was used.
- Download method: the public homepage was fetched directly with `curl -L --http1.1` and a browser-like user agent. No query parameters were required.
- Original archive: `original/` preserves downloaded resources under their host/path hierarchy when available. The exact external host URL remains visible in the raw HTML/CSS mapping.

## Cleaning boundary

`home.html` is a research copy of the public source. Two duplicated Baidu analytics loader blocks and the CNZZ footer injection were removed to keep the local snapshot quiet and deterministic. A research comment marks both removals. Public layout, copy, links, image references and the historical anti-copy `common.js` remain archived for analysis.

The source stack includes jQuery 3.7, Swiper 3.4.2, Swiper Animate, Bootstrap, WOW, Fancybox, Waypoints, CountUp, social-share, Layer, `index.js` and `common.js`. These are evidence of the observed implementation, not a recommendation to reproduce the dependency stack.

## Core alias mapping

| Local alias | Observed source role |
| --- | --- |
| `home.html` | Public Chinese homepage DOM snapshot |
| `main.css` | `www.jxgtx.com/assets/addons/cms/frontend/css/index.css` |
| `media.css` | Homepage responsive media rules |
| `main.js` | Homepage `index.js` interaction logic |
| `common.js` | Public shared interaction and anti-copy logic |
| `jquery-3.7.0.min.js` | jQuery runtime |
| `swiper.jquery.min.js` | Swiper 3.4.2 runtime |
| `swiper.animate1.0.3.min.js` | Swiper Animate plugin |
| `wow.js` / `jquery.countup.min.js` | Scroll reveal and count animation dependencies |
| `images/hero-*` | Five 1920×750 Hero slides |
| `images/category-*` | Six product/solution family visuals |
| `images/service-*` | Product manual, quick guide, video, after-sale icons |
| `images/product-*` | Six representative recommended-product images used by the case page |
| `images/about-team.webp` | About/team visual used in the proof and overview sections |
| `images/news-*.webp` | Current/news and exhibition visual references |
| `images/qr-*.webp` | Public WeChat and 1688 QR references |
| `images/logo.svg`, `tel.svg`, `email.svg`, `language.svg`, `search.svg`, `menu.svg`, `close.svg`, `chevron.svg`, `arrow.svg` | Header, contact and UI icon references |

## Host and CDN coverage

The raw download includes the origin host `www.jxgtx.com`, CSS/JS resources from `g-style-js.bcdn8.com`, image/static resources from `cloud-1251007531.bcdn8.com`, Alibaba icon/font resources from `at.alicdn.com`, and CSS-linked font providers where the response was available. The `original/` directory may contain additional nested assets that are not given a semantic alias; keep them because CSS background paths can depend on their host/path location.

No independent homepage video file was found in the captured source list. “视频教程” is a service entry, not evidence that a playable video asset was successfully archived.

## Screenshots

- `original-home-desktop.png`: 1440×900 headless browser capture of the public homepage.
- `original-home-mobile.png`: 390×844 headless browser capture of the public homepage.
- `case-page-desktop.png`: generated after local case-page QA at 1440×900.
- `case-page-mobile.png`: generated after local case-page QA at 390×844.

## Rights and reuse

Images, Logo, fonts, CSS and JavaScript are retained for internal design research, reverse-engineering and AI context only. They are not a license for production reuse. Recreate visuals or obtain permission before shipping a new site. Public company claims and contact details should be rechecked before any client-facing output.
