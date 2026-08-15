# WordPress 网站类型

样例项目：[daqing](https://github.com/wuyoustudio/daqing.git)

## 目录

- [识别信号与边界](#识别信号与边界)
- [样例工程结构](#样例工程结构)
- [路由、内容与数据流](#路由内容与数据流)
- [编辑入口与内容覆盖风险](#编辑入口与内容覆盖风险)
- [内容导入、后台建模与调用经验](#内容导入后台建模与调用经验)
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

## 内容导入、后台建模与调用经验

客户提供的原始建站资料，默认就是准备公开展示的内容。不要因为资料涉及医疗、产品、专家或服务，就由开发者自行推断“不能公开”、自动降级为草稿、只生成中性摘要或删除原文。只有客户明确标记为内部、待审核、隐私、法律限制，或数据字段明确要求隐藏时，才设置相应的 review gate。

“资料在文件夹里”不等于“网站已经使用”。WordPress 项目至少要验证以下四层是否连通：

| 层 | 必须确认的内容 |
| --- | --- |
| 原始资料 | 文件、表格、图片、文档的清单、数量、编码和来源标识。 |
| 运行时数据 | CPT、Taxonomy、Meta、媒体附件和页面是否已写入 WordPress 数据库。 |
| 查询调用 | 首页、归档、分类、搜索和详情页是否从 WordPress 数据库读取这些记录。 |
| 公网结果 | 关键 URL 的状态码、标题、正文、图片和 JSON-LD 是否实际出现。 |

### 可复用的导入规则

1. **先做 manifest，再做 seed。** 为每个分类、产品、页面、专家、媒体建立稳定的 `source_key`、原始文件、slug 和关系映射；报告至少记录输入数、创建数、更新数、待处理数、失败数和最终数据库数。
2. **把内容真正建模到后台。** 产品放入自定义 post type，产品分类使用 Taxonomy，规格/标签/摘要等使用明确的 Meta 字段，图片进入媒体库；不要只把 JSON 放在主题目录后由模板硬编码读取。
3. **seed 必须幂等且显式指定类型。** 使用 `wp_insert_post()` 或 `wp_update_post()` 更新已有记录时，始终显式传递 `post_type`；只传 `ID` 可能让自定义内容被 WordPress 当成普通文章处理。
4. **定义字段覆盖策略。** 机器同步字段可以覆盖，人工编辑字段必须保留，不能用一次全量 seed 静默覆盖后台内容。空正文需要合法的内容兜底，但兜底不是替代原始资料。
5. **区分后台查询和公开查询。** 主题的公开过滤器不能影响 seed、报告、后台列表和 smoke test；后台同步应使用 `suppress_filters` 或权威数据库查询，公开查询才应用发布状态、分类和明确配置的可见性规则。
6. **处理匹配、重复和 slug 冲突。** 旧资料与表格资料要有 resolver；优先保留已有数据库 ID 和正式 slug，新增冲突使用确定性规则，不能每次部署都生成新记录或新 URL。
7. **统计总量和展示量。** `total_imported`、`published`、`publicly_visible`、`draft` 与 `needs_review` 必须分开统计；不能用“前台显示了几条”代替“后台是否完整导入”。
8. **按页面类型验收。** 至少检查首页、产品归档、分类页、产品详情、搜索、静态页、图片资源和 404；同时检查页面是否真的调用了后台数据，而不是因为模板 fallback 或硬编码看起来正常。

### 本次问题对应的经验

| 问题表现 | 根因 | 固化做法 |
| --- | --- | --- |
| 文件夹里有资料，网站内容仍然很少 | 资料没有进入 WP 数据库，或模板没有调用数据库 | 建 manifest、幂等 seed，并对数据库数量和公网页面分别验收。 |
| seed 只查到少量产品 | 公开查询过滤器影响了后台查询 | 后台/seed/smoke 绕过公开过滤器，必要时直接查数据库。 |
| 产品数量从 53 条变成少量普通文章 | 更新已有 CPT 时漏传 `post_type` | 每次 upsert 显式指定 CPT 类型，并增加数据库快照检查。 |
| 产品正文为空或旧内容被覆盖 | 没有设计空值和字段覆盖策略 | 保留已有非空字段，只有空字段才使用兜底；记录更新结果。 |
| 自动验收误报 | 把 URL 属性、空数组或 CLI 输出格式当成正文/对象/通用能力 | 校验可见正文与属性边界，固定 JSON 类型，并针对服务器 WP-CLI 版本写契约测试。 |
| 远端已更新但发布任务失败 | 只验证远端命令，没有验证报告回收和 finalizer | 将 prepare、seed、smoke、报告回收、finalize 分阶段；成功前保留备份和锁。 |

安全检查的职责是防止代码、配置、权限和未明确禁止的敏感数据误泄露，不是替客户重新判断原始内容能否公开。内容可见性必须来源于客户要求或明确数据状态，并在后台、模板、归档、搜索和 JSON-LD 中保持一致。

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

部署必须在写入前完成数据库导出并生成可验证的成功标记；同时保存当前主题归档、Nginx rewrite/vhost 配置和 active theme。失败回滚要恢复主题文件、数据库和 rewrite 配置，不能只重新激活旧主题。保留远端时间戳备份，smoke test 和报告回收都成功后才清理临时目录。

WordPress 项目默认使用 **PHP 8.2**：开发电脑默认安装 PHP 8.2，线上服务器、PHP-FPM、WP-CLI 和 Actions runner 也应统一在 PHP 8.2 运行。部署前预检需确认远端 `php -v`、`wp --info` 或 WP-CLI 报告的 PHP 版本为 8.2；主题、插件和 seed 脚本按 PHP 8.2 的语法与弃用边界编写，不依赖更低或更高版本的行为。远端 PHP 版本不是 8.2 或执行 `php -l` 出错时，必须阻止自动部署。

不要把 `rsync --delete-after`、root SSH、seed 覆盖和“只恢复 active theme”当作安全默认值。至少补充非 root 账号、固定 SSH 指纹、部署锁、staging、备份保留策略和恢复演练；部署包只允许运行时清单、主题、工具和必要配置进入 web root，原始客户资料与 source snapshot 必须排除或放在 docroot 外。

## WordPress/Nginx/Actions 发布强制注意点

以下规则来自真实发布故障，属于 WordPress 部署的强制检查，不是可选优化。

### 1. 先清理域名、证书和虚拟主机残留

- `nginx -t` 检查的是所有启用的虚拟主机；任何无关站点的坏配置或缺失证书，都会阻止当前 WordPress 站点发布。
- 废弃域名（例如 `macmini.wuyoustudio.com`）不能只从 DNS 或 GitHub workflow 删除。必须核对面板记录、启用中的 Nginx vhost、证书路径、rewrite 文件、Actions 条件和仓库文本引用。
- 删除前将确切配置移动到带时间戳的备份目录；删除后依次执行 `nginx -t` 和 reload，再用 `nginx -T`/文本搜索确认没有活动引用。不要用“忽略某个旧证书错误”的永久例外掩盖问题。

### 2. WP-CLI `eval-file` 参数不能按普通 PHP CLI 假设

- `wp eval-file` 可能把 `--require-backup-marker`、`--report` 等参数当成 WP-CLI 自己的参数，出现 `unknown ... parameter`，脚本甚至还没有开始执行。
- 优先用环境变量传递备份标记、报告路径和 smoke 参数；若使用 positional args，必须在脚本和 CI 中明确支持并写合约测试。
- seed 必须在任何数据库写入前验证清单、checksum 和非空数据库备份标记；缺少标记时进程必须返回非零状态并停止。
- Nginx 站点执行 `wp rewrite flush` 可能提示 `.htaccess` 需要特殊配置。这是 Apache 文件生成警告，不应成为 Nginx 路由来源；路由应由 Nginx 配置负责。

### 3. 自定义路由要验证 Nginx 和 WordPress 两层

- `try_files $uri $uri/ /index.php?$args` 遇到 `/search/` 等路径时，可能先寻找不存在的目录入口，导致 WordPress 收不到请求。
- 对必须稳定存在的自定义入口使用精确 Nginx location，直接转发 WordPress front controller，并明确设置 `SCRIPT_FILENAME`、`SCRIPT_NAME`、`DOCUMENT_URI`、`REQUEST_URI`、`PATH_INFO` 和正确 PHP-FPM socket。不能只验证 `index.php?s=...` 能打开。
- 不要用活动的 `error_page 404 /404.html` 劫持 WordPress 404，除非这是明确设计；否则未知路径应由 WordPress 返回 404。
- 每次修改 rewrite、CPT archive 或页面 slug 后，至少实测首页、归档、详情、静态页、搜索（含 query string）和未知路径；注意 archive slug 与同名 Page 的冲突。

### 4. 远端成功不等于 Actions 成功

- Actions 工作流固定 Node.js 24（例如 `actions/setup-node@v4` 配合 `node-version: 24.x`），不要依赖已弃用的 Node.js 20。
- 部署脚本必须区分远端部署、数据库 seed、线上 smoke 和 runner 报告回收四个阶段。
- 远端已经输出 `Deployment and smoke checks passed`，但 runner 仍可能因本地目标目录不存在而在 `scp` 阶段失败。回收报告前显式执行 `mkdir -p qiyuan/data/generated`，再下载并验证 `seed-report.json`、`smoke-report.json`。
- 远端临时目录只能在报告下载完成后删除；成功发布前不要取消 rollback trap。最终状态以 Actions 的 job、报告校验和公网 smoke 三者同时通过为准。

### 5. 站点身份和语言必须检查数据库选项

- 主题中的品牌 fallback、运行时 settings 和 WordPress `blogname` 必须使用同一个已确认品牌名；不能只改模板而遗留旧站点标题。
- 英文-only 项目要扫描最终 HTML 的 CJK 字符和 `<title>`，并检查 logo 图片中的文字是否按客户要求保留。seed 后重新验证首页、详情页、归档页和搜索页，不只检查 JSON。

### 6. Seed、编辑和回滚必须有明确事实源

- 明确 JSON/runtime manifest、WP-CLI seed、WordPress 后台和模板 fallback 的优先级。幂等 seed 不应覆盖已有编辑内容，除非字段或记录明确标记为机器同步范围。
- 报告必须记录 created、updated、needs-review、failed、resolver decisions 和最终 CPT 数量；最终数量要包含人工审核草稿，不能只统计 approved 或 matched 记录。
- 原始建站资料默认可公开；不要仅凭内容主题或关键词自动把产品、repeatable claims 或页面字段设为草稿/隐藏。若项目明确配置了 review gate，必须让同一状态规则同时作用于后台、归档、分类、搜索、详情和 JSON-LD，不能只在 single template 中晚到 404，导致其他入口展示不一致。

### 7. 发布前最小验证矩阵

```text
php -l <all theme/tools PHP files>
python tools/validate-content.py --repo-root . --strict
python -m unittest discover -s tests -p 'test_*.py'
php tests/test_wp_contracts.php
nginx -t                         # 远端执行
HTTP 200: /, archive, detail, static pages, /search/?s=test
HTTP 404: an unknown path
HTML: expected theme assets, verified brand title, no unintended CJK
```

失败时先读取 seed/smoke 报告和 Nginx test log，再判断是远端回滚、路由问题、内容问题还是 Actions artifact 问题；不要只根据最后一行 `Process completed with exit code 1` 猜测。

## 实施检查清单

- [ ] 确认 WordPress Core、插件、PHP 版本（默认 8.2）、站点目录、媒体目录和数据库权限不依赖未声明状态。
- [ ] 明确 JSON、seed、WP 后台和 fallback 的唯一内容源及覆盖规则。
- [ ] 检查 CPT、Taxonomy、Meta Box、REST schema、权限和后台编辑入口是否一一对应。
- [ ] 修改路由时同步检查 rewrite flush、模板命名、canonical URL 和线上 smoke test。
- [ ] 检查产品分类是否混用了原生 Taxonomy、序号和硬编码 slug。
- [ ] 联系表单必须有真实提交端点、服务端校验、nonce/CSRF、防滥用和失败反馈。
- [ ] 逐项确认导航、联系方式、页面正文是否由后台数据驱动，不要被模板硬编码误导。
- [ ] 部署前执行 PHP lint、数据校验、Nginx 配置检查和关键页面/资源检查。
- [ ] 演练主题、数据库、媒体、插件和配置的完整恢复；不能只验证页面返回 200。
