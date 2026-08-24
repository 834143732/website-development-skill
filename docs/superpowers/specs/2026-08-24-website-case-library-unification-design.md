# 网站案例库结构统一设计

日期：2026-08-24

## 背景

仓库的 `main` 与 `origin/main` 已分叉：本地提交 `a726900` 新增了 `references/site-reviews/` 下的 8 篇 Markdown 案例档案和通用素材库；线上提交 `6862f2c` 新增了 `cases/` 案例快照库。线上案例使用独立目录保存说明、结构化数据、复盘页和来源素材，但 9 个案例合计约 529 MiB，且部分 `case.json` 字段仍不一致。

用户确认以线上 `cases/` 结构为准，同时允许本地新增案例先以轻量形式迁入，不要求立即补齐原站快照、素材和复盘页。

## 目标

- 将 `cases/` 设为仓库中唯一的网站案例库入口。
- 保留本地 8 篇案例档案的有效研究内容，不因合并丢失。
- 允许案例从轻量审阅逐步升级为完整快照，避免为了目录整齐而批量复制原站资产。
- 统一案例的最小文件结构和结构化元数据契约，让 Skill 和脚本可以稳定检索。
- 保留本地提交中的通用素材库及其许可、清单和校验能力。

## 非目标

- 本次不重新浏览或抓取 7 个轻量案例的网站。
- 本次不为轻量案例生成仿制页面、截图或原站素材归档。
- 本次不验证原站宣传数字，也不把原站素材用于客户生产项目。
- 本次不执行 `git push` 或部署。

## 方案

### 1. 唯一目录与渐进完整度

所有案例统一放在 `cases/<slug>/`。每个案例必须包含：

- `README.md`：面向人的事实、经验、适用条件、风险和验收说明；
- `case.json`：面向 AI 和脚本的结构化摘要。

以下内容按证据和授权情况选配：

- `index.html`：可直接打开的视觉化复盘页；
- `assets/source/`：公开站点的研究证据、截图和来源映射。

案例使用 `artifact_level` 标记完整度：

- `review`：只有经过整理的审阅文档和结构化数据；
- `snapshot`：另有复盘页及来源证据资产。

现有线上 9 个案例保持为 `snapshot`；本地 7 个独有案例迁移为 `review`。Phabuilder 同时存在于两侧，以线上快照为主体，把本地多页面审阅中的独有事实、风险和验收边界合入后仍为 `snapshot`。

完整度与文件组合按下表判定：

| `artifact_level` | `README.md` | `case.json` | `index.html` | `assets/source/` | 判定 |
| --- | --- | --- | --- | --- | --- |
| `review` | 必须 | 必须 | 可有 | 可有 | 允许逐步制作增强文件，但消费者不能假定增强文件存在 |
| `snapshot` | 必须 | 必须 | 必须 | 必须且至少有 1 个文件 | 可加载复盘页和来源证据 |

半升级案例继续标记为 `review`，直到 `index.html` 与非空的 `assets/source/` 同时存在并通过校验后才改为 `snapshot`。`review` 不禁止预先存在其中一项，避免升级过程中人为移动或删除有效文件。

### 2. `case.json` 最小契约

新增采用 JSON Schema Draft 2020-12 的 `cases/case.schema.json`。Schema 版本固定为 `1.0.0`，允许项目专属扩展字段，但以下字段及类型必须统一：

| 字段 | 类型与约束 |
| --- | --- |
| `schema_version` | 字符串，固定为 `1.0.0` |
| `slug` | 字符串，匹配 `^[a-z0-9]+(?:[-_][a-z0-9]+)*$`，并与目录名相同 |
| `artifact_level` | 枚举：`review` 或 `snapshot` |
| `title` | 非空字符串 |
| `source` | 绝对 HTTP(S) URL 字符串 |
| `observed_at` | `YYYY-MM-DD` 日期字符串，取最近一次观察日期 |
| `language` | 主语言 BCP 47 风格字符串，如 `zh-CN` 或 `en`；其他语言放可选 `languages` 数组 |
| `industry` | 至少 1 项的非空字符串数组 |
| `page_type` | 非空字符串 |
| `evidence.status` | 非空字符串，说明证据总体状态 |
| `evidence.observations` | 至少 1 项的对象数组；每项必须有 `observed_at`、`scope`、`checked`、`not_checked`、`note`，其中三类清单均为字符串数组 |
| `site_facts` | 字符串数组，只写观察事实，不混入建议或未经核实数字 |
| `transferable_patterns` | 对象数组；每项必须有非空字符串 `name`、`when`、`use`、`guardrail` |
| `do_not_copy` | 非空字符串数组 |
| `source_assets` | 对象数组；每项必须有相对路径 `file`、非空 `kind` 和 `role` |
| `case_files.readme` | 固定为 `README.md` |
| `case_files.metadata` | 固定为 `case.json` |
| `case_files.review_page` | 可选相对路径；存在时固定为 `index.html` |
| `case_files.source_root` | 可选相对路径；存在时固定为 `assets/source` |
| `case_files.supporting_files` | 可选相对路径字符串数组，用于 `styles.css`、`script.js` 等文件 |

所有相对路径必须位于当前案例目录内，不能是绝对路径、不能包含 `..`。`source_assets` 是供 AI 定位的**精选证据清单**，不要求枚举原始归档中的每一个文件，但列出的文件必须真实存在。轻量案例本次统一使用空数组，不能制造不存在的归档证据。`case_files` 则完整声明案例入口文件和顶层支持文件。

可选 `source_claims` 为对象数组，每项必须包含 `claim`、`location`、`verification`。所有原站自述数字、资质、客户、效果和授权关系只能进入 `source_claims`，`verification` 使用原有更具体状态或 `unverified-source-claim`，不得混入 `site_facts`。

### 2.1 旧字段迁移

所有已有案例都写入统一必需字段。对已经接近新结构的案例：字符串 `source`、日期和现有数组直接保留；对象形态的 `site_facts` 先按原分组展平为摘要字符串数组，原分组保留在可选 `site_fact_groups`；现有 `source_assets` 作为精选清单保留；缺失的 `case_files` 根据实际文件生成。

`btj_hcm` 与 `zoe_industry` 按以下规则迁移，避免只为通过 Schema 而丢弃信息：

| 旧字段 | 新字段 |
| --- | --- |
| `id` | `slug` |
| `source.url` / `source.observedAt` / `source.locale` | `source` / `observed_at` / `language`，其备注写入 observation `note` |
| `positioning` | 保留为可选 `positioning`，并从 README 的案例定位生成中文 `industry` 与 `page_type` |
| `navigation`、`productFamilies`、`applications`、`capabilities` | 分别规范为 `navigation`、`product_families`、`applications`、`capabilities`，并提炼不含宣传数字的 `site_facts` 摘要 |
| `brandExamples` | `brand_examples`，保留待核实关系文字 |
| `publicClaims` | `source_claims`；`status` 映射为 `verification`，`location` 设为实际模块或“全站公开内容” |
| `designRules` | 原文保留为可选 `design_rules`，同时根据 README 语境写成具备四字段的 `transferable_patterns` |
| `doNotCopy` | `do_not_copy` |
| `assets` | 规范为可选 `asset_groups`，同时从中选取代表文件写入 `source_assets` |

其他可选字段统一优先使用 snake_case；删除旧的重复 camelCase 键，但保留其等价内容。Schema 允许 `contact`、多语言、导航、产品族、应用等案例专属字段。

### 2.2 本地轻量案例固定映射

7 个独有案例的基本身份固定如下，避免实施时按文件名猜测：

| slug | source | observed_at | language | industry / page_type |
| --- | --- | --- | --- | --- |
| `gpixel` | `https://gpixel.com/` | 2026-08-20 | `en` | 图像传感器、复杂技术产品站 / 技术产品目录与型号详情 |
| `szzygh` | `http://www.szzygh.cn/` | 2026-08-20 | `zh-CN` | 智能制造软件与配套硬件 / B2B 企业官网与行业方案 |
| `iyungo` | `http://www.iyungo.com/` | 2026-08-20 | `zh-CN` | 半导体光芯片测试设备 / 工业装备企业官网 |
| `vision-life` | `https://www.vision-life.cn/` | 2026-08-21 | `zh-CN` | 高端住宅精装工程 / 精品项目与服务品牌站 |
| `funext-protein` | `https://www.funext-protein.com/` | 2026-08-21 | `zh-CN` | 微生物蛋白与食品科技 / 原料、应用与 ESG 品牌站 |
| `tomilo` | `https://www.tomilo.com.cn/` | 2026-08-21 | `zh-CN` | 环境可靠性试验设备 / 复杂产品与行业解决方案站 |
| `yimmet` | `https://www.yimmet.cn/` | 2026-08-21 | `zh-CN` | 室内 LED 照明 / 场景化产品、案例与电商导流站 |

每篇原 Markdown 按同一提取规则迁移：审阅页面和视口写入 observation 的 `scope`/`checked`；“未验证项”写入 `not_checked`；核心判断中的适用边界写入 `page_type` 或 pattern 的 `when`；“值得借鉴”各小节写为 `transferable_patterns`；“不应照搬”写入 `do_not_copy`；明确标记为站点自述的数字、资质和效果写入 `source_claims`。无法从原文确定模块位置时，`location` 写“参考站点审阅范围”。

### 2.3 Phabuilder 双侧合并

线上 2026-08-23 首页快照作为最近观察，因此顶层 `observed_at` 保持 `2026-08-23`。`evidence.observations` 同时保留：

- 2026-08-23：线上首页 DOM、CSS/JS、公开素材及桌面/移动截图；
- 2026-08-21：本地首页、原料、定制方案、智造产线、PHA Life 五页的 1440×900 与 390×844 审阅，以及对应未验证项。

README 以线上快照说明为主体，新增“多页面补充观察”及其适用条件、风险和最小验收；`case.json` 同步增加第二条 observation，并合入只由多页面审阅支持的 `site_facts`、`transferable_patterns`、`do_not_copy` 与 `source_claims`。重复结论去重，任何一侧的未核实自述都不能升级为已核实事实。

### 3. 索引与 Skill 路由

`cases/README.md` 成为案例库总索引，并说明必需文件、可选增强、完整度状态、权利边界、新案例创建步骤和最小 `README.md + case.json` 模板。索引表至少包含案例、行业、受众/页面类型、观察日期、完整度和重点模式。每个一级案例目录必须恰好有一个索引条目；索引不得包含重复 slug、失效链接或非案例目录。

仓库根 `README.md` 只保留案例库入口和简短说明，避免维护第二份完整清单。`SKILL.md` 中所有 `references/site-reviews/` 路由改为 `cases/README.md` 与 `cases/<slug>/README.md`；以后分析优秀网站时直接在 `cases/` 新建或更新案例。

迁移完成后删除 `references/site-reviews/`，避免同一案例有两个事实来源。案例文档中指向 `assets/library/` 的相对链接按新目录位置修正。

### 4. Git 合并策略

在当前 `main` 上保留两侧已有提交历史，不执行 reset、clean、rebase 或强制覆盖。执行合并前必须确认当前分支为 `main`、工作区干净并重新运行 `git fetch origin main`。随后记录 `git rev-parse origin/main`：

- 如果仍为已审阅的 `6862f2c`，直接合并该提交；
- 如果远端 tip 已变化，先检查新增提交列表和 diff。新增内容仍属于本次案例库范围且不覆盖本地独有内容时，合并新的已确认 tip；出现无关、破坏性或无法判断的改动时暂停并向用户报告。

使用已记录的完整 commit SHA 作为实际合并目标，避免长时间操作中 `origin/main` 再次漂移。预期两侧主要是新增文件，若出现冲突，按以下优先级处理：

1. `cases/` 的目录形态以线上提交为基础；
2. `SKILL.md` 同时保留本地素材库规则，并把案例路径改为新目录；
3. `README.md` 合并安装说明与统一案例库入口；
4. `references/lessons-learned.md` 保留两侧记录，案例路径同步更新。

合并后再执行迁移与规范化提交。整个过程不推送远端。

## 数据流

制作或审阅网站时，Codex 先读取 `cases/README.md`，根据行业、受众、页面类型、内容密度和完整度选择少量相关案例，再读取对应 `README.md`；需要结构化筛选或资产定位时读取 `case.json`。只有 `artifact_level=snapshot` 且 `case_files`/`source_assets` 声明了对应文件时，才加载复盘页或来源资产。

新增案例先写 `README.md + case.json` 即可进入索引；取得合规证据并完成视觉复盘后，再增加 `index.html` 和 `assets/source/`，把完整度升级为 `snapshot`。

## 错误与边界处理

- 缺少必需字段或声明了不存在的文件时，校验失败并指出具体案例和字段。
- 轻量案例不得因没有 `index.html` 或素材而失败；其 `artifact_level` 必须为 `review`。
- 快照案例若声明 `snapshot`，必须存在 `index.html` 和 `assets/source/`。
- 未核实数字保留为参考站自述或待验证信息，不进入可迁移事实。
- 原站品牌、照片、字体和整站源码继续受案例说明中的权利边界约束；本次迁移不新增这类素材。
- Git 冲突不能通过删除一侧内容解决；先比较独有信息，再形成合并版本。

## 验证

- Git：确认 `main` 已包含 `a726900` 与 `6862f2c`，工作区不存在未解决冲突。
- 结构：每个 `cases/<slug>/` 都有 `README.md` 和合法的 `case.json`。
- 契约：新增无第三方依赖的 `scripts/validate-case-library.ps1`，读取 Draft 2020-12 Schema 的约束并执行 PowerShell 侧文件系统/索引检查。命令为 `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\validate-case-library.ps1`；成功退出 0，任何错误输出案例、字段/路径并退出 1。
- 校验器测试：新增 `scripts/test-case-library-validator.ps1`，使用临时夹具覆盖合法 `review`、合法 `snapshot`、slug/目录不一致、缺必需文件、snapshot 缺复盘页、snapshot 来源目录为空、越界路径、非法完整度、索引缺项和重复索引。命令为 `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\test-case-library-validator.ps1`。
- 索引：校验 `cases/README.md` 与一级案例目录一一对应，并验证每个链接目标存在；`case.schema.json` 及说明文件不作为案例目录。
- 链接：对 `SKILL.md`、根 `README.md`、`cases/` 与 `references/lessons-learned.md` 扫描，不得存在 `references/site-reviews/` 路由；`docs/superpowers/specs/` 和历史计划中的背景描述不纳入此检查。
- 素材库：运行现有素材库测试与校验脚本，确认合并没有破坏清单、许可和哈希。
- 抽查：至少检查一个 `review` 案例、一个普通 `snapshot` 案例和合并后的 Phabuilder 案例。
- 仓库体量：线上快照库基线为 2383 个文件、约 528.91 MiB。7 个新 `review` 目录本次只能新增 `README.md` 和 `case.json`，不得新增 `assets/`、`index.html` 或二进制文件；合并后的总增量只应来自文本、Schema 和校验脚本，而不是新的批量原站资产。

## 验收标准

- 案例只从 `cases/` 进入，不再维护重复的 `references/site-reviews/`。
- 本地 7 个独有案例可从总索引访问，Phabuilder 的两侧独有信息均被保留。
- 16 个案例都满足统一最小契约，并能区分 `review` 与 `snapshot`。
- 通用素材库及其校验能力保留且验证通过。
- 本地分支完成合并与结构统一，但没有未经授权的推送。
