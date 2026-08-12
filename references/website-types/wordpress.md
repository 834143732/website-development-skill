# WordPress 网站类型

样例项目：`D:\wuyoustudio\daqing`

## 目录

- [识别信号与边界](#识别信号与边界)
- [样例工程结构](#样例工程结构)
- [路由、内容与数据流](#路由内容与数据流)
- [编辑入口与内容覆盖风险](#编辑入口与内容覆盖风险)
- [前端交互](#前端交互)
- [构建、部署与回滚](#构建部署与回滚)
- [实施检查清单](#实施检查清单)

## 识别信号与边界

当仓库包含自定义主题、PHP 模板、`functions.php`、WordPress CPT/Taxonomy、WP-CLI 或主题部署目录时，按 WordPress 项目处理。不要只因为仓库里有 PHP 就做此判断；必须确认运行时由 WordPress Core、数据库和主题共同渲染。

WordPress 项目的主要边界是：

- 主题代码负责模板、查询、字段归一化和前端资源。
- WordPress 数据库负责文章、分类、媒体、设置和自定义字段。
- WP-CLI seed 可以初始化或覆盖数据库内容，但不应默认视为“只读初始化”。
- 插件、WordPress Core、服务器配置和媒体目录可能不在仓库内，部署前必须单独核对。

## 样例工程结构

`daqing` 的职责分布如下：

| 路径 | 作用 |
| --- | --- |
| `daqing/theme/daqing/` | 自定义主题，包含模板、CSS、JS、图片和产品 JSON。 |
| `daqing/theme/daqing/functions.php` | 注册主题能力、CPT、Taxonomy、资源和 URL/查询辅助函数。 |
| `daqing/theme/daqing/inc/content.php` | 读取 JSON、查询 CPT、标准化字段并提供 fallback。 |
| `daqing/theme/daqing/inc/meta-fields.php` | 产品和荣誉的后台 Meta Box 与保存逻辑。 |
| `daqing/tools/wordpress-seed.php` | 用 WP-CLI 幂等写入页面、分类、产品、荣誉和站点选项。 |
| `daqing/deploy/daqing.wuyoustudio.com.conf` | Nginx 前端控制器配置。 |
| `.github/workflows/deploy.yml` | 同步主题、备份、seed、Nginx reload 和线上 smoke test。 |

样例中未发现 `package.json`、`composer.json`、Dockerfile、WordPress Core 或仓库内插件目录；不要假定存在 npm/Composer 构建链或插件代码。

## 路由、内容与数据流

请求链通常是：

```text
浏览器 → Nginx try_files → WordPress index.php → Query/CPT/Meta → inc/content.php → PHP 模板 → CSS/JS
```

样例的路由与模板关系：

| 路由 | 模板/来源 |
| --- | --- |
| `/` | `front-page.php`；seed 将首页设置为静态首页。 |
| `/products/` | `archive-daqing_product.php`。 |
| `/products/{slug}/` | `single-daqing_product.php`。 |
| `/news/` | `archive-daqing_news.php`。 |
| `/news/{slug}/` | `single-daqing_news.php`；部分 fallback 详情仍由归档页处理。 |
| `/about/`、`/solutions/`、`/service/`、`/quality/`、`/honor/`、`/contact/` | 对应 `page-*.php`，页面模板由 seed 写入。 |
| 其他普通页面/404 | `page.php` / `404.php`。 |

样例注册了：

- `daqing_product`：产品归档 `/products/`，配合 `daqing_product_category` 分类法。
- `daqing_honor`：荣誉内容，rewrite slug 为 `honor-reference`，无专用归档。
- `daqing_news`：新闻归档 `/news/` 和详情路由。

产品目录和产品运行时数据不是单一来源：`data/products.json` 提供分类、产品和图片基线；WordPress CPT、Meta 和分类提供运行时内容；`inc/content.php` 又提供数据库为空时的 fallback。产品子分类筛选还依赖 PHP 中的序号映射，不是完全由原生 Taxonomy 驱动。修改一个内容字段时要同时搜 JSON、seed、字段读取和模板。

## 编辑入口与内容覆盖风险

样例的实际编辑边界：

- 产品：WP 后台 CPT + Meta Box，字段包括 tagline、summary、image、applications、features、specs 等。
- 荣誉：WP 后台 CPT + Meta Box，字段包括 kicker、summary、image。
- 新闻：原生标题、正文、摘要、特色图；未发现 kicker/image 的专用 Meta Box。
- 分类：WP 分类管理，但产品子分类展示仍有硬编码映射。
- 静态页面：多数 `page-*.php` 直接输出文案，不调用 `the_content()`；后台编辑页面正文不会自动改变页面展示。

`wordpress-seed.php` 在部署时使用 `wp_update_post()`、`update_post_meta()` 等操作重写页面、产品和荣誉。部署前必须明确内容源：

1. Git/JSON/seed 是唯一事实源；后台编辑只能作为临时预览；或
2. WP 后台是唯一事实源；seed 只创建缺失内容，不覆盖已编辑内容。

没有明确选择前，不要把 seed 继续称作“初始化脚本”并直接部署。

## 前端交互

`script.js` 是未打包的主题脚本，处理移动菜单、下拉菜单、产品分类跳转、Hero 轮播、IntersectionObserver reveal/计数器、typewriter、返回顶部和 reduced-motion。交互是完整页面导航，不是 AJAX 数据层。

特别检查联系表单：样例的提交事件被 `preventDefault()` 拦截，仅显示前端成功提示；未发现 `fetch`、WordPress endpoint、邮件 API 或数据库写入。因此 UI 显示“提交成功”不代表线索已投递。

导航位置虽在 `functions.php` 注册，但未发现 `wp_nav_menu()`，`header.php` 中的导航仍是硬编码。修改菜单前先确认后台菜单是否真的参与渲染。

## 构建、部署与回滚

样例没有 npm/Composer 构建；Actions 主要做确定性文件校验、远程 PHP lint、`nginx -t` 和页面/资源 smoke test。部署链为：

1. `main` push 或手动触发。
2. 使用 `SSH_PRIVATE_KEY` 连接服务器，`rsync --delete-after` 同步主题。
3. 上传并执行 WP-CLI seed，安装 Nginx 配置并 reload。
4. 验证首页、产品/新闻路由、静态页面和图片。

已有时间戳主题、`wp-config.php`、rewrite 配置和 best-effort 数据库导出备份；失败时可恢复旧 active theme。但未发现完整的数据库、媒体、插件、Core 和配置恢复流程，也没有成功发布版本目录或一键回滚。

不要把 `rsync --delete-after`、root SSH、seed 覆盖和“只恢复 active theme”当作安全默认值。至少补充非 root 账号、固定 SSH 指纹、部署锁、staging、备份保留策略和恢复演练。

## 实施检查清单

- [ ] 确认 WordPress Core、插件、PHP 版本、站点目录、媒体目录和数据库权限不依赖未声明状态。
- [ ] 明确 JSON、seed、WP 后台和 fallback 的唯一内容源及覆盖规则。
- [ ] 检查 CPT、Taxonomy、Meta Box、REST schema、权限和后台编辑入口是否一一对应。
- [ ] 修改路由时同步检查 rewrite flush、模板命名、canonical URL 和线上 smoke test。
- [ ] 检查产品分类是否混用了原生 Taxonomy、序号和硬编码 slug。
- [ ] 联系表单必须有真实提交端点、服务端校验、nonce/CSRF、防滥用和失败反馈。
- [ ] 逐项确认导航、联系方式、页面正文是否由后台数据驱动，不要被模板硬编码误导。
- [ ] 部署前执行 PHP lint、数据校验、Nginx 配置检查和关键页面/资源检查。
- [ ] 演练主题、数据库、媒体、插件和配置的完整恢复；不能只验证页面返回 200。
