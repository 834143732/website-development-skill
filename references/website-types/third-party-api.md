# 第三方 API 网站类型

样例项目：[feidekeNew](https://github.com/wuyoustudio/feidekeNew.git)

## 目录

- [识别信号与请求链](#识别信号与请求链)
- [样例前端结构](#样例前端结构)
- [Orchard 数据适配与代理](#orchard-数据适配与代理)
- [配置、迁移与缓存](#配置迁移与缓存)
- [测试、构建与部署](#测试构建与部署)
- [风险与实施检查清单](#风险与实施检查清单)

## 识别信号与请求链

当页面展示依赖外部 CMS、内容平台、GraphQL/REST 服务或第三方媒体库，仓库不拥有主要业务数据库时，按第三方 API 项目处理。先画出实际调用链，不要因为仓库有 `server/` 就把它当成自建业务后端。

样例的主要链路是：

```text
页面 → useSiteData → useOrchardSiteData → useOrchardClient → Orchard GraphQL
产品分类 → /orchard/product-taxonomy-tree → orchardAdmin → Orchard REST
图片 → /orchard-media/* → Orchard /media/*
留言 → 客户端直接 POST Orchard /api/messages
```

当前未发现 Nuxt server GraphQL 代理或留言代理；客户端拼接绝对 Orchard URL。`nuxt.config.ts` 的 `/api` Vite proxy 是开发代理配置，不能当作生产 API 层。

## 样例前端结构

入口使用 `NuxtLayout` + `NuxtPage`；`layouts/site.vue` 在服务端加载菜单和站点信息，并统一渲染 Header、Main、Footer。页面采用显式分段路由：

`/`、`/about`、`/contact`、`/product`、`/product/category/:id`、`/product/item/:id`、`/article`、`/article/category/:id`、`/article/item/:id`、`/case`、`/case/category/:id`、`/case/item/:id`、`/knowledge`、`/knowledge/item/:id`。

列表/分类页通常执行 `loadBaseData()` → `useAsyncData()` → `useHead()`；分类页通过动态 key 和 `watch` 避免缓存串页。通用组件集中在 `components/site/`，包括 Header、Footer、HeroBanner、ItemGrid、Breadcrumbs、RichContent 和 ContactForm。

页面数据应通过适配层拿到稳定的展示模型，不要让每个页面自行拼 GraphQL 字段。样例的适配层负责产品、新闻、案例、页面、Taxonomy、Banner、settings 和留言方法；改字段时要同时检查客户端查询、适配器、页面和测试。

## Orchard 数据适配与代理

样例产品/新闻分类不是通过 Orchard `where` 过滤，而是拉取内容后在适配层根据 `termContentItemIds` 过滤。产品分类树的 REST 请求失败时，前端回退到 GraphQL 平铺分类；server 端对分类树缓存 10 分钟。

图片资源主要来自 Orchard Media：`useStaticImage.ts` 和 `server/routes/orchard-media/[...path].ts` 将内容项映射到媒体路径，代理检查空路径和 `.`/`..` 段，并只转发必要响应头。`shared/image-map.json` 保存 `contentItemId → 媒体相对路径` 映射。

旧 `.html` 地址由 `server/middleware/legacy-redirect.ts` 301 到新分段路由；当前逻辑基于 `pathname`，没有保留 query string。`routeRules` 给首页、产品、案例、新闻、关于和联系页配置不同 SWR TTL，同时明确不缓存 `/api/**`、`/orchard/**` 和 `/orchard-media/**`。修改这些规则后必须实际构建并验证缓存，而不能只读配置下结论。

## 配置、迁移与缓存

`nuxt.config.ts` 读取的变量包括 `NUXT_PUBLIC_ORCHARD_BASE`、资源和菜单/页面 ID、`API_DB_HOST/USER/PASSWORD`、`DB_NAME` 等。每个变量都要追踪到真实读取方：样例中 `API_DB_*`、`assetBase`、`dbName` 未发现有效消费者，`caseMenuId` 在适配层固定为 `-1`，不能把“已配置”误当成“已生效”。

迁移脚本位于 `migration/`，总体顺序为登录 → 分类/子分类 → 产品 → 新闻 → 页面 → settings，再处理图片、Banner 和图标。脚本使用 CSRF、Cookie、幂等标题查询、下载/上传/重命名、HEAD 验证和 `shared/image-map.json` 映射。

迁移前必须做 dry-run、映射完整性和媒体验证。样例文档要求执行 `migration/70-migrate-banner.mjs`，但该文件当前未发现，`SUMMARY.md` 也标记 Banner 未完成；文档与脚本不一致时以文件存在性和可执行结果为准。

## 测试、构建与部署

样例 `package.json` 提供 `dev`、`build`、`preview`、`test`；Node 要求 `>=20`，`.nvmrc` 和 Actions 使用 Node 22。当前 9 个测试文件共 40 项通过，但测试主要是源码正则、共享函数和布局断言，未覆盖 Orchard API、媒体代理、迁移脚本、SSR hydration 或部署。

Actions 在 `main` push 或手动触发时执行 `npm ci` → `npm run build` → SCP `.output`/package 文件 → 远程 PM2 启动 3022 端口。未发现 CI 执行 `npm test`、lint、typecheck 或真实 HTTP 健康检查；远程脚本主要通过等待和进程列表确认服务。

第三方 API 项目的部署不只验证前端进程：还要验证外部 API 地址、GraphQL schema、媒体、缓存、迁移后的数据和留言路径。生产环境的 API 基址、密钥和后台凭据必须由环境变量/Secrets 注入，不能沿用样例中的明文凭据或 HTTP 固定地址。

## 风险与实施检查清单

样例已经暴露的高风险模式：

- 迁移脚本和文档存在明文后台凭据，运行时/媒体地址存在 HTTP 固定 IP。
- 案例列表的 `caseMenuId` 固定为 `-1`，可能导致列表为空；详情路径却使用另一套 `fetchCases()`。
- Products/News 查询没有选择适配器读取的发布时间字段，缺失时可能被当前时间替代。
- `fetchPage(id)` 拉取全部页面后用 `pages[id - 1]` 取值，依赖返回顺序而不是 contentItemId。
- GraphQL 响应的 `errors`、分页和请求量没有统一处理；部分 ID 直接拼接进查询字符串。
- 富文本使用 `v-html`，留言直接 POST 第三方接口，未发现服务端防滥用层。

实施时逐项检查：

- [ ] 统一 Orchard、媒体、旧站和 Admin 地址为可验证的运行时配置，并从仓库移除凭据。
- [ ] 明确 `contentItemId`、分类树、时间字段、页面 ID、媒体映射和 GraphQL errors 的适配契约。
- [ ] 检查分类列表、案例列表、详情、旧 URL、query string、SSR hydration 和缓存 TTL。
- [ ] 为 API 客户端、server 代理、重定向、媒体安全和留言提交增加集成测试。
- [ ] 迁移前执行 dry-run、重复执行验证、内容/图片映射检查、HEAD/HTTP 验证和脚本文档一致性检查。
- [ ] Actions 中执行测试、构建、类型/静态检查和真实 HTTP 健康检查；失败时保留旧版本并可回滚。
