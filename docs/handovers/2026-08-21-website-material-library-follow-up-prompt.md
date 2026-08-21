# 网站案例与素材库后续整理提示词

下次在仓库 `D:\wuyoustudio\website-development-skill` 中继续时，可直接使用以下提示词：

~~~text
继续完成网站案例库与通用素材库的收尾工作。先阅读并遵循 AGENTS.md、SKILL.md、references/asset-library.md、docs/superpowers/specs/2026-08-21-website-material-library-design.md 和 docs/superpowers/plans/2026-08-21-website-material-library.md，不要重复已经完成的浏览器审阅。

当前已完成：
1. 许可安全的 assets/library/，包含清单、原创 CSS/JS、Lucide 图标、原创 neutral-grid.svg 和许可证。
2. 素材库 PowerShell 校验器与夹具测试。
3. 8 个案例档案：Gpixel、卓越光华、云中谷、Vision-Life、Funext Protein、Tomilo、YIMMET、Phabuilder。
4. 8 个档案均已补“素材观察与归档”；Phabuilder 已完成桌面 1440x900、移动 390x844、首页和四类内页审阅。
5. references/site-reviews/index.md 已更新为 8 案例，references/lessons-learned.md 已记录 Phabuilder 与跨站素材规则。

请只完成剩余收尾，不下载或复制任何参考站品牌资产、照片、字体、CSS 或 JavaScript：
1. 检查 8 个案例档案的“素材观察与归档”表，统一术语、相对链接、状态和许可风险，修正明显重复或不准确表述。
2. 检查 references/asset-library.md 是否需要增加跨站模式索引；只有存在明确复用收益时才修改，不新增风格近似的重复文件。
3. 检查 assets/library/manifest.json 的 12 个资产与磁盘文件一致，不随意增加素材。
4. 更新 docs/superpowers/plans/2026-08-21-website-material-library.md 的完成复选框，保留确实未完成的项目。
5. 运行且只运行必要验证：
   pwsh -NoProfile -File scripts/test-asset-library-validator.ps1
   pwsh -NoProfile -File scripts/validate-asset-library.ps1
   node --check assets/library/js/accessible-disclosure-nav.js
   node --check assets/library/js/reveal-on-scroll.js
   git diff --check
   python -X utf8 C:\Users\Administrator\.codex\skills\.system\skill-creator\scripts\quick_validate.py .
6. 额外验证 8 个案例档案都包含“素材观察与归档”、索引相对链接都存在、索引案例数为 8、清单无未登记文件或错误哈希。

验证连续 3 分钟无输出或进展就终止并记录未完成项，不重复盲跑。保留用户现有改动；不要 reset、clean、checkout、切分支、pull、push 或创建 worktree。除非我明确要求，不要提交。
~~~

本提示词生成时，浏览器视口覆盖已恢复。上一次提交前只执行最小快速校验，以上完整验证需要在后续任务中补跑并如实记录结果。
