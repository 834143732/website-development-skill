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

### 2. `case.json` 最小契约

新增 `cases/case.schema.json` 作为契约。所有案例至少统一这些字段：

- `schema_version`
- `slug`
- `artifact_level`
- `title`
- `source`
- `observed_at`
- `language`
- `industry`
- `page_type`
- `evidence`
- `site_facts`
- `transferable_patterns`
- `do_not_copy`
- `source_assets`
- `case_files`

字段允许在不破坏最小契约的情况下增加项目专属内容。`source_claims`、多语言、导航、产品族、应用和联系方式等继续作为可选字段。现有 `btj_hcm` 与 `zoe_industry` 的异构字段会映射到统一字段，同时保留有价值的专属信息。

`evidence` 必须明确已检查、未检查和证据说明；`source_assets` 只列实际存在的文件。轻量案例的 `source_assets` 为空数组，不能制造不存在的归档证据。

### 3. 索引与 Skill 路由

`cases/README.md` 成为案例库总索引，并说明必需文件、可选增强、完整度状态和权利边界。索引表至少包含案例、行业、受众/页面类型、观察日期、完整度和重点模式。

仓库根 `README.md` 只保留案例库入口和简短说明，避免维护第二份完整清单。`SKILL.md` 中所有 `references/site-reviews/` 路由改为 `cases/README.md` 与 `cases/<slug>/README.md`；以后分析优秀网站时直接在 `cases/` 新建或更新案例。

迁移完成后删除 `references/site-reviews/`，避免同一案例有两个事实来源。案例文档中指向 `assets/library/` 的相对链接按新目录位置修正。

### 4. Git 合并策略

在当前 `main` 上合并 `origin/main`，保留两侧已有提交历史，不执行 reset、clean、rebase 或强制覆盖。预期两侧主要是新增文件，若出现冲突，按以下优先级处理：

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
- 契约：运行案例校验脚本，检查必需字段、slug、完整度与实际文件一致性。
- 链接：检查 `SKILL.md`、根 README、案例索引和案例文档不存在遗留的 `references/site-reviews/` 路径。
- 素材库：运行现有素材库测试与校验脚本，确认合并没有破坏清单、许可和哈希。
- 抽查：至少检查一个 `review` 案例、一个普通 `snapshot` 案例和合并后的 Phabuilder 案例。
- 仓库体量：记录线上快照库既有体量，本次轻量迁移不得引入新的批量原站资产。

## 验收标准

- 案例只从 `cases/` 进入，不再维护重复的 `references/site-reviews/`。
- 本地 7 个独有案例可从总索引访问，Phabuilder 的两侧独有信息均被保留。
- 16 个案例都满足统一最小契约，并能区分 `review` 与 `snapshot`。
- 通用素材库及其校验能力保留且验证通过。
- 本地分支完成合并与结构统一，但没有未经授权的推送。
