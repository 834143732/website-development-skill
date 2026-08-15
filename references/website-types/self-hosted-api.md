# 自建后端 API 网站类型

样例审计：[mumen](https://github.com/wuyoustudio/mumen.git)

> 重要校正：用户将 `mumen` 归入“自建后端 API”，但当前仓库代码证据显示它是 Nuxt SSR 前端加外部内容 API 客户端。不能把 Nuxt/Nitro 生成的 `.output/server/index.mjs` 当成业务后端；若真实后端在另一个仓库，必须把两个仓库作为两个部署单元核对。

## 目录

- [如何确认是真正的自建 API](#如何确认是真正的自建-api)
- [mumen 的实际逻辑](#mumen-的实际逻辑)
- [真正自建 API 的边界](#真正自建-api-的边界)
- [构建与部署要求](#构建与部署要求)
- [实施检查清单](#实施检查清单)

## 如何确认是真正的自建 API

只有同时看到下列证据，才把项目标为“自建后端 API”：

- `server/api/`、独立 `server/`、Express/Fastify/Nest/Spring 等后端入口，或明确的同仓库 API handler。
- 路由/controller/service/schema/migration 等业务后端代码。
- `GET` 之外的写入契约，如登录、表单、后台管理、`POST/PUT/PATCH/DELETE`。
- 数据库、缓存、队列或第三方服务的服务端凭据只在服务端使用。
- Actions/部署脚本明确发布 API、执行迁移、重启 API 服务并做健康检查。

不能作为充分证据的信号：Nuxt SSR、`.output/server/index.mjs`、前端 `$fetch`、开发代理、`.env` 中有 API URL，或页面能显示远程数据。

真正的请求链应接近：

```text
浏览器 → 同源前端/SSR → 自建 API → 校验/鉴权/业务服务 → 数据库/外部服务
```

## mumen 的实际逻辑

`mumen` 使用 Nuxt 4、Vue 3 和 `@nuxtjs/i18n`。页面入口在 `app/pages/`，全局出口在 `app/app.vue`，公共结构由 `SiteHeader`、`SiteFooter`、`Banner` 和 `InnerPage` 组件组成。

路由主要包括：

- `/`、`/en` 首页。
- `/contact` 联系页。
- `/products`、`/products/detail?id=` 产品列表/详情。
- `/cases`、`/cases/detail?id=` 案例列表/详情。
- `app/pages/[...slug].vue` 处理 about/service/partner/news 动态页、旧案例 301 和 404。

数据层混合了本地和远程来源：

- `app/data/site.ts`、`app/data/site.en.ts` 保存公司介绍、页面骨架、静态产品/案例/新闻和本地 fallback。
- `app/composables/useSiteData.ts` 使用 `$fetch` 访问外部 `02.mkfsj.cn` 的 `/api/menus`、`/api/items`、`/api/pages` 等接口。
- 产品、案例、新闻按菜单 ID、标题别名、层级和分页逻辑组装；首页无数据时有局部 fallback。
- `useSiteLocale.ts` 将 `en` 映射为 `en-US` 并选择语言数据库；配置虽然出现 `DB_NAME_JP`，但未发现完整日文路由或 locale。
- 部分 API HTML 通过 `v-html` 渲染，未发现清洗逻辑。

仓库根目录未发现 `server/`、`server/api/`、数据库 schema/migration、ORM、controller 或 API 部署流程；联系页也未发现真实的询盘 `POST` 接口。因此实际项目应记录为“外部 API 客户端”，而非自建 API。

## 真正自建 API 的边界

如果以后把此类项目改为同仓库自建 API，应把边界写清楚：

- 前端 composable 只依赖稳定的同源 API 契约，不把数据库表结构直接泄露到组件。
- API 层负责请求校验、鉴权、权限、限流、错误码、日志和敏感数据过滤。
- 写入接口必须有服务端验证、幂等策略、失败回滚或可重试语义；前端“显示成功”不能代替服务端确认。
- 数据库 migration 必须可审计、可重复执行或明确回滚；部署顺序要与 API 兼容窗口匹配。
- SSR/Nitro 运行时、业务 API、数据库和对象存储是不同依赖，分别记录启动、健康检查和回滚方式。

## 构建与部署要求

`mumen` 当前的运行命令是 `npm run dev`、`npm run build`、`npm run preview` 和 `npm test`。Actions 的实际链路为：打包源码 → SCP/SSH → 远程 `npm ci` 和 `npm run build` → 发布 `.output` → 配置 `HOST/NITRO_HOST/PORT/NITRO_PORT` → PM2 重启；PM2 不可用时 fallback 到 `pkill + nohup node server/index.mjs`。

当前未发现部署后的 HTTP 健康检查、自动回滚、数据库迁移、API 服务重启或集中日志告警。若真实后端另有仓库，不能只部署 mumen 的 `.output`；要同时验证前端所需 API 版本、CORS/同源策略、环境变量和服务重启顺序。

对类似项目的默认部署顺序：

1. 锁定 Node 和依赖，执行 `npm ci`、单元测试、构建和类型/静态检查。
2. 对 API 做兼容性检查和 migration dry-run；先发布向后兼容的 API，再切换前端。
3. 发布前端产物和服务端运行时，使用 PM2/systemd 等明确的进程管理器重启。
4. 用真实健康端点验证 API、SSR 首页、双语言路由、关键写入和错误态。
5. 失败时恢复前端/API 版本，并确认数据库 migration 是否可逆；不要只看进程存在。

## 实施检查清单

- [ ] 先证明后端代码、API handler、数据存储和部署脚本实际存在；缺失时标记为外部 API 依赖。
- [ ] 核对 `NUXT_PUBLIC_API_BASE`、`NUXT_PUBLIC_IMAGE_BASE`、`DB_NAME`、语言数据库及服务器变量。
- [ ] 为菜单 ID、层级、分页、`IsShow`、`Deleted`、图片字段和语言 fallback 建立 fixture 或契约测试。
- [ ] 检查 API 失败时 SSR、列表、详情和 fallback 的行为，避免空页面或假成功。
- [ ] 把 `v-html` 的可信来源、HTML 清洗和 CSP 作为上线前安全项。
- [ ] 询盘/登录等写入操作必须对接明确的 `POST` API，包含校验、限流、鉴权和失败反馈。
- [ ] 不把 `.output/server/index.mjs` 误写成业务 API；单独列出 Nitro SSR 与业务服务。
- [ ] 部署同时验证迁移、API 健康端点、前端构建、进程状态、日志和自动回滚。
