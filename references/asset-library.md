# 网站通用素材库

## 使用边界

- 仓库只保存许可证明确的开源素材、公共领域或 CC0 素材，以及 Wuyou Studio 自行编写或生成的通用素材。
- 参考网站的 Logo、品牌图形、产品图、项目照片、客户图片、字体、整份 CSS、整份 JavaScript 和打包文件不进入素材库；只在案例档案中记录用途、来源和自行实现建议。
- 素材可用于加速客户网站制作，但必须根据客户品牌、内容、受众、断点和技术栈重新组合。不得把素材库当成整站模板，也不得用通用背景代替真实产品、项目或人物资产。
- 成熟开源库优先通过项目包管理器使用。仓库只保存少量高频、可独立使用且许可证通知能够完整保留的文件。

## 使用流程

1. 按类别和标签从本页或 `assets/library/manifest.json` 查找候选素材。
2. 确认 `allowedUse`、许可证、署名要求、修改状态和项目技术栈。
3. 复制到客户项目后按品牌和组件契约改造；第三方素材同时保留对应许可证通知。
4. 用真实内容检查桌面端、移动端、键盘、减少动效、弱网和脚本失败状态。
5. 如果修改本仓库中的素材，更新 `bytes` 与 `sha256`，再运行：

```powershell
pwsh -NoProfile -File scripts/test-asset-library-validator.ps1
pwsh -NoProfile -File scripts/validate-asset-library.ps1
```

## 归档状态

| 状态 | 含义 | 处理方式 |
| --- | --- | --- |
| 已归档 | 许可证明确或自行创作，文件与清单均在仓库 | 可按许可和组件契约复用 |
| 本地重写 | 参考站展示了有价值的模式，但其源码不适合复制 | 使用仓库原创 CSS/JS 或在项目中重新实现 |
| 仅作参考 | 品牌、产品、项目、人物、字体或许可不明资产 | 只记录观察和来源，不下载、不用于客户项目 |
| 待验证 | 来源、许可证或真实用途无法确认 | 不落盘，确认前不进入生产项目 |

## 素材索引

### 图标

以下 SVG 来自 [Lucide 官方仓库](https://github.com/lucide-icons/lucide)，适合常见工具按钮。再分发源文件时保留 [Lucide 许可通知](../assets/library/licenses/lucide-LICENSE.txt)。图标本身不提供可访问名称，必须由按钮文字、`aria-label` 或相邻可见文本说明用途。

| 素材 | 标签 | 许可证 | 典型用途 |
| --- | --- | --- | --- |
| [menu.svg](../assets/library/icons/menu.svg) | 导航、菜单 | ISC | 移动菜单按钮 |
| [x.svg](../assets/library/icons/x.svg) | 关闭、取消 | ISC + MIT | 抽屉、弹窗关闭按钮 |
| [arrow-up.svg](../assets/library/icons/arrow-up.svg) | 方向、返回顶部 | ISC + MIT | 返回顶部按钮 |
| [search.svg](../assets/library/icons/search.svg) | 搜索、筛选 | ISC + MIT | 搜索提交或打开按钮 |
| [phone.svg](../assets/library/icons/phone.svg) | 电话、联系 | ISC | 电话入口 |
| [external-link.svg](../assets/library/icons/external-link.svg) | 外链、新窗口 | ISC + MIT | 标记第三方目标 |

### CSS

| 素材 | 标签 | 组件契约 |
| --- | --- | --- |
| [focus-ring.css](../assets/library/css/focus-ring.css) | 焦点、强制颜色、表单、导航 | 引入后可用 CSS 变量改色；不要用其他规则移除可见焦点 |
| [motion-safe-reveal.css](../assets/library/css/motion-safe-reveal.css) | 入场、减少动效、渐进增强 | 与 `data-reveal` 和 `reveal-on-scroll.js` 配合；无 JS 时内容默认可见 |

### JavaScript

| 素材 | 标签 | 组件契约 |
| --- | --- | --- |
| [accessible-disclosure-nav.js](../assets/library/js/accessible-disclosure-nav.js) | 移动菜单、Esc、焦点管理 | 根节点使用 `data-disclosure-nav`；原生按钮提供 `data-disclosure-toggle`、`aria-controls` 和目标面板 ID；可选关闭按钮使用 `data-disclosure-close` |
| [reveal-on-scroll.js](../assets/library/js/reveal-on-scroll.js) | IntersectionObserver、减少动效 | 元素使用 `data-reveal`；默认单次出现，`data-reveal-once="false"` 可重复；减少动效时直接显示终态 |

### 图片与视觉底图

| 素材 | 标签 | 使用边界 |
| --- | --- | --- |
| [neutral-grid.svg](../assets/library/images/neutral-grid.svg) | 中性、网格、科技背景 | 自行创作的装饰底图，可改色；不能替代真实产品、案例或场景照片 |

## 清单字段

`assets/library/manifest.json` 是素材文件的唯一结构化清单。每项记录稳定 ID、类别、路径、标签、说明、来源、许可证、修改状态、允许用途、SHA-256、字节数和备注。除清单本身外，`assets/library/` 中的每个文件都必须登记；未登记文件和清单中不存在的文件都会使验证失败。

## 安全与许可检查

- SVG 不允许脚本、事件处理器、`foreignObject`、`javascript:` 或远程 `href`。
- CSS/JS 不允许出现已分析参考站的域名，也不保存 `.min.css` 或 `.min.js` 第三方包副本。
- 单文件默认不超过 2 MiB；确需超过时必须在清单中给出 `sizeException` 和用途依据。
- 无法从官方或权利人来源确认许可证时，状态必须是“仅作参考”或“待验证”。页面公开可访问不等于允许复制。
- 外部许可证可能变化；新增或升级第三方素材时重新检查官方来源，不根据旧案例记录推断。

## 案例素材观察

单站档案的“素材观察与归档”记录该站提供的视觉和交互启发，并明确对应状态。多个站点出现相同模式时优先链接同一份原创通用实现，不按颜色或动画参数复制多个近似文件。
