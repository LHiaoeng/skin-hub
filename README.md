# Skin Hub 架构方案

Skin Hub 是一个面向搜索引擎友好的 LOL 皮肤展示与检索网站。页面组织参考 `https://www.skinexplorer.lol/`：首页聚合最新皮肤、英雄、皮肤宇宙、皮肤系列入口；核心内容使用稳定、可索引的详情页承载，而不是只依赖客户端筛选。

前端项目：`D:\WebstormProjects\skin-hub`

后端接口项目：`D:\IdeaProjects\light-shadow-wallpaper-admin`

## 目标

- SEO 优先：核心列表页、详情页、聚合页使用服务端渲染或静态生成，保证 HTML 首屏包含主体内容。
- 检索体验清晰：支持按英雄、皮肤名、系列、宇宙、稀有度、是否限定、PBE、发布时间等条件筛选。
- 页面结构稳定：每个英雄、皮肤、系列、宇宙都有独立 URL，便于收录、分享和内部链接。
- 图片体验稳定：皮肤原画、加载图、头像、炫彩图等走统一图片组件和 CDN/代理策略。
- 后端低侵入：优先复用现有 `light-shadow-wallpaper-admin` 数据与同步能力；必要时补充只读公开接口。

## 技术选型

建议使用 `Next.js App Router + TypeScript`。

选择理由：

- `Next.js` 原生支持 SSR、SSG、ISR、动态 sitemap、metadata、Open Graph，适合 SEO 内容站。
- React 生态便于构建复杂筛选、图片瀑布流、详情交互。
- 页面组件直接在服务端调用后端公开接口，数据请求与渲染合一，结构简单。

建议依赖：

- 框架：`next`、`react`、`typescript`
- 样式：
  - **主方案：`tailwindcss` + CSS Modules 混用**
    - Tailwind 负责布局、间距、响应式、通用工具类
    - CSS Modules 负责皮肤卡片、详情页等需要精细动画和复杂选择器的组件
  - **组件层：`shadcn/ui`**（基于 Radix UI + Tailwind，完全 Server Component 友好）
  - **主题切换：`next-themes`**（支持明暗模式切换，默认暗色主题）
  - **配置：Tailwind `darkMode: 'class'` 策略**
- 数据请求：原生 `fetch` + 服务端缓存；客户端交互用 `nuqs` 管理 URL 查询参数
- 图标：`lucide-react`
- SEO：Next Metadata API、动态 `sitemap.ts`、`robots.ts`
- 质量：`eslint`、`prettier`、`vitest`、`playwright`

## 总体架构

```text
Browser / Search Bot
        |
        v
Next.js Frontend (SSR / SSG / ISR)
        |
        |-- App pages: 可索引页面、详情页、筛选页
        |-- 服务端组件直接调用后端公开接口
        |
        v
light-shadow-wallpaper-admin
        |
        |-- /rest/lol/*                 公开 LOL 基础信息
        |-- /rest/wallpaper/*           壁纸与皮肤图片资源
        |-- /rest/lol/prestige-chromas  臻彩藏品
        |-- /rest/news/*                公告与热点
        |
        v
MySQL / Redis / OSS / CommunityDragon / Tencent LOL data
```

## 推荐目录结构

```text
skin-hub/
  src/
    app/
      page.tsx
      layout.tsx
      robots.ts
      sitemap.ts
      skins/
        page.tsx
        [skinId]/
          page.tsx
      champions/
        page.tsx
        [championId]/
          page.tsx
      skinlines/
        page.tsx
        [skinlineId]/
          page.tsx
      universes/
        page.tsx
        [universeId]/
          page.tsx
      mythic-shop/
        page.tsx
      prestige-chromas/
        page.tsx
      wallpapers/
        page.tsx
      news/
        page.tsx
      api/
        image-proxy/
          route.ts
    components/
      layout/
      skin/
      champion/
      filters/
      seo/
      ui/
    features/
      skins/
      champions/
      skinlines/
      universes/
      mythic-shop/
    lib/
      api/
        backend-client.ts
        endpoints.ts
      seo/
        metadata.ts
        schema.ts
        sitemap.ts
      images/
        cdn.ts
      routing/
        slug.ts
    styles/
      globals.css
    types/
      api.ts
      lol.ts
  public/
    favicon.ico
    og/
  .env.local
  next.config.ts
```

## 页面规划

| 页面 | 路由 | 渲染策略 | SEO 目标 |
| --- | --- | --- | --- |
| 首页 | `/` | ISR | 聚合最新皮肤、热门英雄、皮肤宇宙、皮肤系列 |
| 皮肤检索 | `/skins` | SSR | 可索引筛选页，支持 query 参数 |
| 皮肤详情 | `/skins/[skinId]` | SSG/ISR | 承载皮肤名称、英雄、系列、稀有度、原画、炫彩、上线时间 |
| 英雄列表 | `/champions` | SSG/ISR | 英雄入口页 |
| 英雄详情 | `/champions/[championId]` | SSG/ISR | 展示英雄资料与该英雄全部皮肤 |
| 皮肤系列列表 | `/skinlines` | SSG/ISR | 系列入口页 |
| 皮肤系列详情 | `/skinlines/[skinlineId]` | SSG/ISR | 展示同系列皮肤、描述、关联宇宙 |
| 皮肤宇宙列表 | `/universes` | SSG/ISR | 宇宙入口页 |
| 皮肤宇宙详情 | `/universes/[universeId]` | SSG/ISR | 聚合多个系列与皮肤 |
| 神话商店 | `/mythic-shop` | SSR/ISR | 展示当前轮换、历史出现次数 |
| 臻彩藏品 | `/prestige-chromas` | ISR | 展示臻彩列表与更新列表 |
| 壁纸 | `/wallpapers` | SSR | 按英雄、皮肤、分辨率检索壁纸 |
| LOL 公告 | `/news` | SSR/ISR | 聚合 LOL 公告与热点 |

URL 建议使用稳定 ID + 可读 slug：

```text
/skins/91001-ahri-spirit-blossom
/champions/103-ahri
/skinlines/40-spirit-blossom
/universes/12-star-guardian
```

服务端解析时以 ID 为准，slug 只用于可读性；slug 变化时可 301 到新地址。

## SEO 策略

- 每个核心详情页生成唯一 `title`、`description`、`canonical`、Open Graph 图片。
- 列表页 query 参数只开放有搜索价值的组合，例如 `championId`、`skinlineId`、`rarity`、`legacy`；无意义组合加 `noindex`。
- 动态生成 `sitemap.xml`，包含首页、皮肤详情、英雄详情、系列详情、宇宙详情、神话商店、臻彩页。
- 使用 JSON-LD：
  - `WebSite` + `SearchAction` 用于站内搜索。
  - `CollectionPage` 用于列表页。
  - `ImageObject` 用于皮肤原画。
  - `BreadcrumbList` 用于详情页面包屑。
- 图片必须提供稳定 `alt`，例如：`阿狸 灵魂莲华 皮肤原画`。
- 详情页首屏服务端输出主体信息，客户端只增强筛选、收藏、图片预览等交互。

## 数据与接口接入

### 已确认可用的公开接口

后端公开接口主要在 `admin/src/main/java/.../openapi` 下：

```text
GET /rest/lol/getPbeChampionInfo?championId=
GET /rest/lol/getTencentChromasInfo?chromasInstanceId=&chromasName=
GET /rest/getLolMythicShop
GET /rest/getTFTShopData
GET /rest/queryMythicShopByInstanceId?instanceId=
GET /rest/queryMythicShopInstanceStats
GET /rest/getWallpaperByInstanceId?instanceId=
GET /rest/getMinStartTime
GET /rest/lol/prestige-chromas
GET /rest/lol/prestige-chromas/updates
GET /rest/wallpaper/page
GET /rest/wallpaper/getRandomWallpaper
GET /rest/news/getLolAnnouncementNews
GET /rest/news/getHupuLolNews
```

### 后台管理接口

以下接口当前带权限校验，不能直接给前台公开调用：

```text
GET /lol/skin/page
GET /lol/champion/page
GET /lol/skinline/page
GET /lol/universe/page
```

建议后端在 `openapi` 控制器下补充以下只读公开接口，无需鉴权注解，仅供前台只读消费：

```text
GET /rest/lol/skins
    皮肤分页列表
    参数：page、size、championId、skinlineId、rarity、legacy、pbe、q（关键字）

GET /rest/lol/skins/{riotSkinId}
    皮肤详情（含炫彩 JSON、所属系列 ID 集合）

GET /rest/lol/champions
    英雄列表（id、heroId、name、nameEng、title、roles、squarePortraitPath）

GET /rest/lol/champions/{heroId}
    英雄详情，附带该英雄全部皮肤列表

GET /rest/lol/skinlines
    皮肤系列列表（id、riotSkinlineId、name、engName、description）

GET /rest/lol/skinlines/{riotSkinlineId}
    系列详情，附带关联皮肤列表与关联宇宙信息

GET /rest/lol/universes
    宇宙列表（id、lolUniverseId、name、engName、imagePath）

GET /rest/lol/universes/{lolUniverseId}
    宇宙详情，附带关联系列列表与皮肤列表

GET /rest/lol/search?q=
    全局搜索，匹配皮肤名、英雄名、系列名，返回分类结果
```

实现说明：

- 以上接口复用现有 `/lol/skin/page`、`/lol/champion/page`、`/lol/skinline/page`、`/lol/universe/page` 的 Service 层逻辑，只需新建 `openapi` 包下的 Controller 暴露为公开接口。
- 返回字段只输出前台展示所需字段，后台管理字段（操作人、更新时间等）不暴露。
- 建议统一返回格式与现有公开接口保持一致。

## 前端数据模型

核心模型按后端字段收敛：

```ts
export interface Skin {
  id: number
  riotSkinId: number
  contentId?: string
  championId: number
  isBase: number
  name: string
  nameEng?: string
  description?: string
  rarity?: string
  regionRarityId?: number
  isLegacy?: number
  isPbeOnly?: number
  releaseTime?: string
  splashPath?: string
  uncenteredSplashPath?: string
  tilePath?: string
  loadScreenPath?: string
  chromasJson?: string
  skinlineIdSets?: string
  emblemNames?: string
}

export interface Champion {
  id: number
  heroId: number
  name: string
  nameEng?: string
  title?: string
  roles?: string
  squarePortraitPath?: string
}

export interface Skinline {
  id: number
  riotSkinlineId: number
  name: string
  engName?: string
  description?: string
}

export interface Universe {
  id: number
  lolUniverseId: number
  name: string
  engName?: string
  imagePath?: string
  lolSkinlineIdSets?: string
}
```

## 组件分层

- `app/*`：路由、metadata、页面级数据获取。
- `features/*`：业务模块容器，例如皮肤检索、英雄详情、神话商店。
- `components/*`：可复用 UI，例如皮肤卡片、英雄头像、筛选条、图片预览。
- `lib/api/*`：后端请求封装、错误处理、缓存策略。
- `lib/seo/*`：metadata、JSON-LD、sitemap 数据生成。
- `types/*`：接口 DTO 和前端归一化模型。

## 缓存策略

- 首页：`revalidate = 3600`。
- 皮肤、英雄、系列、宇宙详情：`revalidate = 86400`，数据同步后可按需 revalidate。
- 神话商店：根据后端返回的商品结束时间或最小结束时间设置较短缓存。
- 新闻：`revalidate = 120`，匹配后端 Redis 两分钟缓存。
- 图片：优先直接使用 CDN/OSS 地址；跨域或防盗链资源走 `/api/image-proxy`。

## 搜索与筛选

首期做 URL 驱动筛选，所有筛选条件反映在 query 上：

```text
/skins?q=ahri
/skins?championId=103
/skins?skinlineId=40
/skins?rarity=legendary&legacy=1
/skins?pbe=1
```

实现原则：

- 服务端根据 query 获取首屏结果。
- 客户端切换筛选时更新 URL，便于分享和回退。
- 复杂全文检索首期走数据库 `keyword`；数据量增大后再接 Meilisearch 或 Elasticsearch。

## 视觉与体验方向

- **默认暗色主题**：皮肤原画在暗背景下视觉效果更佳，降低视觉噪音，突出图片色彩
- **明暗模式切换**：通过 `next-themes` 实现，支持手动切换和系统偏好跟随，避免主题闪烁（FOUC）
- **样式 SEO 优化**：
  - CSS 输出体积极小（Tailwind purge 后 5-15KB），可内联到 `<head>` 提升 FCP
  - 使用 `aspect-ratio` 锁定图片比例，避免布局抖动（CLS 友好）
  - 用 `next/font` 优化字体加载，避免 FOUT
- 第一屏直接给可用检索与内容，不做纯营销落地页
- 皮肤卡片以原画或 loading 图为主视觉，保留英雄、稀有度、系列、状态徽章
- 详情页突出大图、基础信息、炫彩、所属系列、同英雄其他皮肤
- 移动端优先保证筛选可用：筛选抽屉、排序菜单、紧凑卡片网格

## 环境变量

```env
NEXT_PUBLIC_SITE_URL=https://skin-hub.example.com
BACKEND_BASE_URL=http://127.0.0.1:9527
IMAGE_PROXY_ALLOW_HOSTS=game.gtimg.cn,raw.communitydragon.org,oss.breadj.com
```

## 部署建议

- 前端：Node Server 或 Docker；国内服务器建议 Node Server + Nginx。
- 后端：继续使用 `light-shadow-wallpaper-admin`，保证 MySQL、Redis、OSS、定时同步任务可用。
- Nginx：
  - `/` 转发到 Next.js。
  - 图片域名配置到 `next.config.ts` 的 `images.remotePatterns`。

## CI/CD

使用 **TeamCity** 作为 CI/CD 平台。

### 构建流水线（前端）

```text
触发条件：main 分支 push 或 Pull Request

1. Install        pnpm install --frozen-lockfile
2. Lint           pnpm lint
3. Type Check     pnpm tsc --noEmit
4. Test           pnpm vitest --run
5. Build          pnpm build
6. E2E (可选)     pnpm playwright test
7. Deploy         将 .next/ 产物部署到目标服务器
```

### 构建流水线（后端）

```text
触发条件：后端仓库 main 分支 push

1. Build          mvn clean package -DskipTests
2. Test           mvn test
3. Deploy         将 jar 包部署到目标服务器，重启服务
```

### 环境变量管理

- 敏感变量存入 TeamCity **Parameters** 或 **Vault**，构建时注入，不提交到代码仓库。
- 各环境（staging / production）使用独立的 Build Configuration 或 Deployment Target，区分 `.env` 注入。

### 推荐配置要点

- 前端构建使用 `pnpm`，在 TeamCity Agent 上安装 Node.js 和 pnpm，或使用 Docker Agent 镜像。
- 开启 **Build Cache**：缓存 `node_modules` 和 `.next/cache`，加速增量构建。
- PR 构建只跑 Lint + Type Check + Test，不做部署，保持反馈速度。
- main 分支合并后触发完整构建 + 自动部署到 staging，生产部署需要手动确认（TeamCity Deployment Approval）。

## 开发阶段

1. 初始化 Next.js 项目骨架、样式系统、基础布局、后端 client。
2. 后端补充只读公开接口：皮肤、英雄、系列、宇宙列表与详情。
3. 实现首页、皮肤检索页、皮肤详情页。
4. 实现英雄、系列、宇宙列表与详情页，打通内部链接。
5. 实现神话商店、臻彩藏品、壁纸、公告页。
6. 补充 sitemap、robots、JSON-LD、Open Graph、canonical。
7. 用 Playwright 检查桌面和移动端首屏、筛选、详情页图片渲染。

## 关键风险

- 目前核心数据接口 `/lol/skin/page`、`/lol/champion/page`、`/lol/skinline/page`、`/lol/universe/page` 是后台权限接口，前台正式上线前必须完成后端只读公开接口的补充。
- 后端文档存在编码显示问题，后续应统一为 UTF-8，避免中文字段说明和接口文档不可读。
- 图片来源跨多个域名，必须提前处理远程图片白名单、防盗链、缓存和失败占位图。
- 皮肤、系列、宇宙之间存在逗号分隔 ID 集合，前端应在服务端归一化，避免页面组件内反复解析。
