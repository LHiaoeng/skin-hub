# Skin Hub 项目需求文档

本文档用于沉淀 `skin-hub` 的产品需求、功能规格、已确认的产品决策、业务规则和交互细节。内容基于根目录 `README.md`、`.aiassistant/rules/README.md`、`docs/phase-1-report.md` 以及当前已落地代码整理。

## 1. 项目背景

- `skin-hub` 是一个 SEO 友好的 LOL 皮肤展示与浏览站，内容组织参考 `skinexplorer.lol`。
- 前端项目位于 `D:\WebstormProjects\skin-hub`，技术栈为 `Next.js App Router + TypeScript`。
- 后端接口项目为 `D:\IdeaProjects\light-shadow-wallpaper-admin`。
- 后续开发需要优先遵循当前项目已有的技术栈、目录结构、代码风格和分层边界。
- 核心内容必须由稳定、可索引的列表页、聚合页、详情页承载，不能只依赖客户端筛选。
- 产品体验 PC 优先，同时必须保证移动端可访问核心路径。
- 后端接入策略为低侵入：优先复用现有数据与同步能力，只补充只读公开接口。

## 2. 产品目标

- SEO 优先：核心列表页、详情页、聚合页使用 SSR、SSG 或 ISR，保证 HTML 首屏包含主体内容。
- 浏览与搜索体验清晰：`/skins` 承载皮肤列表浏览，Header 全局搜索承载英雄、皮肤、系列、宇宙等内容的快速直达。
- 页面结构稳定：每个英雄、皮肤、系列、宇宙都应拥有独立 URL，便于收录、分享和内部链接。
- 图片体验稳定：皮肤原画、加载图、头像、炫彩图等走统一图片组件、CDN 或代理策略。
- 默认暗色主题：突出皮肤原画视觉表现，并支持明暗模式切换，避免主题闪烁。

## 3. 文档目录约定

- 相关项目文档统一放在 `docs/` 目录下。
- `docs/prd.md`：存放项目需求文档、功能规格、已确认的产品决策。
- `docs/images/`：存放截图、界面参考图、流程图等图片资料。
- `docs/api/`：存放 API 文档、接口约定、第三方服务对接说明。

## 4. 已确认技术边界

- 前端框架：`Next.js App Router + TypeScript`。
- 数据请求：服务端组件优先使用原生 `fetch` 调后端公开接口，并结合 SSR、SSG、ISR。
- 样式方案：`Tailwind CSS + CSS Modules` 混用。
- 主题方案：`next-themes`，Tailwind 使用 `darkMode: "class"` 策略，默认暗色并支持系统偏好。
- 图标方案：`lucide-react`。
- 路径别名：`@/*` 指向 `src/*`。
- SEO 能力：Next Metadata API、`sitemap.ts`、`robots.ts`、JSON-LD、canonical、Open Graph。
- 质量命令：`npm run lint`、`npm run build`。

## 5. 已确认目录边界

- `src/app`：路由、页面、metadata、`robots.ts`、`sitemap.ts`。
- `src/components`：可复用 UI，如布局、皮肤卡片、筛选、SEO 组件。
- `src/features`：复杂业务容器；新增复杂业务优先放这里，不塞进页面文件。
- `src/lib/api`：后端请求、错误处理、缓存策略。
- `src/lib/seo`：metadata、JSON-LD、sitemap 数据。
- `src/lib/images`：CDN、代理、图片地址处理。
- `src/lib/routing`：slug、URL 解析、跳转规则。
- `src/types`：后端 DTO 与前端归一化模型。

## 6. 页面规划与当前状态

| 页面 | 路由 | 目标渲染策略 | 当前状态 | 需求说明 |
| --- | --- | --- | --- | --- |
| 首页 | `/` | ISR | 已落地 | 聚合 PBE 新增皮肤、英雄入口、皮肤系列、皮肤宇宙。 |
| 皮肤列表 | `/skins` | SSR/ISR | 已落地轻量版，待调整 | 承载皮肤列表浏览，可按上线时间、皮肤品质、皮肤徽章等维度分组显示。 |
| 皮肤详情 | `/skins/[skinId]` | SSG/ISR | 已落地 | 服务端渲染皮肤主体信息、原画、加载图、基础信息、系列信息、JSON-LD。 |
| 英雄列表 | `/champions` | SSG/ISR | 已落地 | 复用首页英雄入口内容，支持 `role`、`position` query 筛选。 |
| 英雄详情 | `/champions/[championId]` | SSG/ISR | 已落地，待按参考图调整 | 参考 `docs/images/championDetail.png`，展示英雄主体信息与该英雄皮肤卡片列表。 |
| 皮肤系列列表 | `/skinlines` | SSG/ISR | 已落地入口页 | 复用聚合页入口内容。 |
| 皮肤系列详情 | `/skinlines/[skinlineId]` | SSG/ISR | 待开发 | 展示同系列皮肤、描述、关联宇宙。 |
| 皮肤宇宙列表 | `/universes` | SSG/ISR | 已落地入口页 | 复用聚合页入口内容。 |
| 皮肤宇宙详情 | `/universes/[universeId]` | SSG/ISR | 待开发 | 聚合多个系列与皮肤。 |
| 神话商店 | `/mythic-shop` | SSR/ISR | 待开发 | 展示当前轮换、历史出现次数。 |
| 臻彩藏品 | `/prestige-chromas` | ISR | 待开发 | 展示臻彩列表与更新记录。 |

## 7. URL 规则

- 详情 URL 使用稳定 ID + 可读 slug。
- 示例：
  - `/skins/91001-ahri-spirit-blossom`
  - `/champions/103-ahri`
  - `/skinlines/40-spirit-blossom`
  - `/universes/12-star-guardian`
- 服务端解析时以 ID 为准，slug 只用于可读性；slug 变化时可 301 到新地址。

## 8. 数据与接口

### 8.1 已确认可优先复用的公开接口

- `GET /rest/lol/getPbeChampionInfo?championId=`
- `GET /rest/lol/getTencentChromasInfo?chromasInstanceId=&chromasName=`
- `GET /rest/getLolMythicShop`
- `GET /rest/getTFTShopData`
- `GET /rest/queryMythicShopByInstanceId?instanceId=`
- `GET /rest/queryMythicShopInstanceStats`
- `GET /rest/getWallpaperByInstanceId?instanceId=`
- `GET /rest/getMinStartTime`
- `GET /rest/lol/prestige-chromas`
- `GET /rest/lol/prestige-chromas/updates`
- `GET /rest/wallpaper/page`
- `GET /rest/wallpaper/getRandomWallpaper`
- `GET /rest/news/getLolAnnouncementNews`
- `GET /rest/news/getHupuLolNews`

### 8.2 前台正式数据需要补充的只读公开接口

- `GET /rest/lol/skins`
  - 皮肤分页列表。
  - 参数：`page`、`size`、`championId`、`skinlineId`、`rarity`、`legacy`、`pbe`、`releaseTime`、`emblem` 等。
  - 需要支持 `/skins` 按上线时间、皮肤品质、皮肤徽章等维度进行列表分组显示所需的数据。
- `GET /rest/lol/skins/{riotSkinId}`
  - 皮肤详情，包含炫彩 JSON、所属系列 ID 集合。
- `GET /rest/lol/champions`
  - 英雄列表，包含 `id`、`heroId`、`name`、`nameEng`、`title`、`roles`、`squarePortraitPath`。
- `GET /rest/lol/champions/{heroId}`
  - 英雄详情，附带该英雄全部皮肤列表。
- `GET /rest/lol/skinlines`
  - 皮肤系列列表，包含 `id`、`riotSkinlineId`、`name`、`engName`、`description`。
- `GET /rest/lol/skinlines/{riotSkinlineId}`
  - 系列详情，附带关联皮肤列表与关联宇宙信息。
- `GET /rest/lol/universes`
  - 宇宙列表，包含 `id`、`lolUniverseId`、`name`、`engName`、`imagePath`。
- `GET /rest/lol/universes/{lolUniverseId}`
  - 宇宙详情，附带关联系列列表与皮肤列表。
- `GET /rest/lol/search?q=`
  - Header 全局搜索，匹配英雄、皮肤、系列、宇宙等内容，返回分类结果。
  - 每条结果需要支持“小图 + 明细 + 内容类型”的展示结构。
  - 结果项需要包含可跳转到对应详情页的稳定目标 URL 或生成 URL 所需的稳定 ID 与类型。

### 8.3 接口实现原则

- 优先复用现有 `/lol/skin/page`、`/lol/champion/page`、`/lol/skinline/page`、`/lol/universe/page` 的 Service 层逻辑。
- 公开接口只输出前台展示所需字段，不暴露后台管理字段。
- 返回格式与现有公开接口保持一致。
- 皮肤、系列、宇宙的逗号分隔 ID 集合应在服务端或数据层归一化，避免页面组件重复解析。

## 9. 前端数据模型

核心模型按后端字段收敛，当前项目已在 `src/types/lol.ts` 中维护类型定义。

- `Skin`：皮肤 ID、英雄 ID、名称、描述、稀有度、限定状态、PBE 状态、上线时间、原画、加载图、炫彩 JSON、系列 ID 集合等。
- `Champion`：英雄 ID、中文名、英文名、称号、定位、头像、描述等。
- `Skinline`：系列 ID、系列名、英文名、描述、关联信息等。
- `Universe`：宇宙 ID、宇宙名、英文名、图片、关联系列集合等。

## 10. SEO 与体验规则

- 每个核心详情页生成唯一 `title`、`description`、`canonical`、Open Graph 图片。
- `sitemap.xml` 覆盖首页、核心详情页、系列/宇宙页、神话商店、臻彩页；当前已覆盖首页和部分皮肤详情。
- 列表页 query 参数只开放有搜索价值的组合；无意义组合应 `noindex`。
- 必要页面输出 JSON-LD：
  - `WebSite` + `SearchAction` 用于站内搜索。
  - `CollectionPage` 用于列表页。
  - `ImageObject` 用于皮肤原画。
  - `BreadcrumbList` 用于详情页面包屑。
- 详情页首屏服务端输出主体信息，客户端只增强筛选、收藏、图片预览等交互。
- 图片必须提供稳定尺寸、明确 `alt`、远程域名白名单；新增域名同步更新 `next.config.ts`。
- 图片优先 CDN/OSS；跨域或防盗链资源走 `/api/image-proxy`。

## 11. 皮肤列表与全局搜索

### 11.1 皮肤列表

- `/skins` 是皮肤列表页，不作为独立检索页。
- `/skins` 用于浏览皮肤集合，可按上线时间、皮肤品质、皮肤徽章等维度分组显示。
- 分组需要服务端输出首屏主体内容，保证列表内容可索引。
- 分组类页面或状态可使用 URL query 驱动，条件反映在 query 上。
- 示例：
  - `/skins?group=releaseTime`
  - `/skins?group=rarity`
  - `/skins?group=emblem`
- 服务端根据 query 获取列表页首屏结果。
- 客户端切换分组或过滤条件时同步 URL，便于分享、回退和索引策略控制。

### 11.2 Header 全局搜索

- Header 搜索可以搜索任何内容，包括英雄、皮肤、系列、宇宙等。
- Header 搜索框参考 `docs/images/searchBox.png` 开发：
  - 输入框位于 Header 搜索区域。
  - 输入关键词后展示下拉结果列表。
  - 结果项展示“小图 + 明细 + 内容类型”。
  - 英雄、皮肤等有图片资源的结果优先展示头像、缩略图或皮肤小图。
  - 系列、宇宙等无图或暂未返回图片的结果仍展示名称、明细和内容类型。
  - 内容类型需要明确标注，例如 `Champion`、`Skin`、`Skinline`、`Universe`。
  - 点击任一结果项后跳转到对应详情页。
- Header 全局搜索首期可走数据库 `keyword`；数据量增大后再评估 Meilisearch 或 Elasticsearch。

## 12. 英雄详情页

- 英雄详情页参考 `docs/images/championDetail.png` 设计。
- 页面使用该英雄基础皮肤图片作为背景图，基础皮肤判断条件为 `src/types/lol.ts` 中 `Skin.isBase = 1`。
- 背景图需要做暗色遮罩与毛玻璃效果，保证主体文字和皮肤卡片可读。
- 背景图和皮肤卡片图片都复用项目已有的通用图片处理逻辑，不新增独立图片拼接或代理分支。
- 英雄中文名称和中文称号作为主要信息展示，视觉优先级最高。
- 中文名称和中文称号后展示复制按钮小图标，点击后复制对应文本。
- 英雄英文名称和英文称号作为次要信息展示。
- 英文名称和英文称号后展示复制按钮小图标，点击后复制对应文本。
- 中文描述作为次要内容展示，优先使用后端返回的中文描述字段。
- 中文名称、中文称号、英文名称、英文称号、中文描述缺失时显示占位内容，不隐藏对应信息块。
- 皮肤列表以卡片形式展示：
  - 卡片上方展示皮肤图片，图片来源使用 `src/types/lol.ts` 中 `Skin.tilePath`。
  - 卡片下方展示皮肤名称。
  - 皮肤名称旁展示皮肤品质图标，逻辑与首页“PBE 新增”中的皮肤品质图标逻辑保持一致。
  - 点击皮肤卡片跳转到对应皮肤详情页。
- 皮肤列表需要服务端输出首屏内容，保证英雄详情页仍可被搜索引擎索引。

## 13. 缓存策略

- 首页：`revalidate = 3600`。
- 皮肤、英雄、系列、宇宙详情：`revalidate = 86400`。
- 神话商店：根据后端返回的商品结束时间或最小结束时间设置较短缓存。
- 图片：优先直接使用 CDN/OSS 地址；跨域或防盗链资源走 `/api/image-proxy`。

## 14. 视觉与移动端要求

- 第一屏直接给可用浏览与内容，不做纯营销落地页。
- 皮肤卡片以原画或加载图为主视觉，保留英雄、稀有度、系列、状态徽章。
- 详情页突出大图、基础信息、炫彩、所属系列、同英雄其他皮肤。
- 桌面端以 3-4 列卡片网格为主，移动端降级为单列或双列紧凑布局。
- 移动端筛选可收入底部抽屉，避免占用主内容区域。
- 图片使用 `next/image` 的 `sizes` 按断点输出合适分辨率。
- 移动端可点击区域不小于 44×44px。
- 正文字号不小于 14px，避免 iOS 自动缩放。
- 移动端导航需要保持核心入口可达。

## 15. 环境变量

```env
NEXT_PUBLIC_SITE_URL=https://skin-hub.example.com
BACKEND_BASE_URL=http://127.0.0.1:9527
IMAGE_PROXY_ALLOW_HOSTS=game.gtimg.cn,raw.communitydragon.org,oss.breadj.com
```

本地一期开发报告中使用的示例环境变量：

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BACKEND_BASE_URL=http://localhost:9527
```

## 16. 已开发里程碑

### 16.1 一期已完成

- 搭建 `Next.js App Router + TypeScript` 前端工程。
- 完成首页 `/`，聚合 PBE 新增皮肤、英雄入口、皮肤系列、皮肤宇宙。
- 完成皮肤详情页 `/skins/[skinId]`，服务端渲染皮肤主体信息、原画、加载图、基础信息和系列信息。
- 补充轻量皮肤列表页 `/skins`，避免皮肤入口断链。
- 增加 SEO 基础能力：Metadata、canonical、Open Graph、JSON-LD、`robots.ts`、`sitemap.ts`。
- 增加后端数据访问封装，默认读取 `BACKEND_BASE_URL`。
- 页面只渲染真实接口结果，接口不可用时显示空状态。
- 首页“PBE 新增”使用 `isPbeOnly=1` 查询 PBE-only 皮肤列表。
- 样式按技术选型调整为 `tailwindcss` + CSS Modules。
- 明暗模式改为 `next-themes` class 策略，默认暗色并支持系统偏好。

### 16.2 当前代码已追加落地

- `/champions` 英雄入口页已落地，并支持 `role`、`position` query。
- `/champions/[championId]` 英雄详情页已落地，包含英雄资料、皮肤列表、排序、复制字段能力；待按 `docs/images/championDetail.png` 调整视觉与皮肤卡片。
- `/skinlines` 皮肤系列入口页已落地。
- `/universes` 皮肤宇宙入口页已落地。
- `src/lib/api/backend-client.ts` 已对正式公开接口和旧分页接口做兼容读取。
- `src/lib/routing/slug.ts` 已承载 ID + slug 的 URL 生成与解析。

## 17. 后续里程碑

1. 补齐后端只读公开接口：皮肤、英雄、系列、宇宙列表与详情。
2. 调整 `/skins` 为皮肤列表页，支持按上线时间、皮肤品质、皮肤徽章等维度分组显示。
3. 按 `docs/images/searchBox.png` 实现 Header 全局搜索，支持英雄、皮肤、系列、宇宙等内容的即时结果下拉与详情页跳转。
4. 按 `docs/images/championDetail.png` 调整 `/champions/[championId]` 英雄详情页。
5. 实现 `/skinlines/[skinlineId]` 系列详情页。
6. 实现 `/universes/[universeId]` 宇宙详情页。
7. 实现 `/mythic-shop` 神话商店页。
8. 实现 `/prestige-chromas` 臻彩藏品页。
9. 扩展 sitemap 覆盖英雄详情、系列详情、宇宙详情、神话商店、臻彩页。
10. 用 Playwright 检查桌面和移动端首屏、列表分组、全局搜索、英雄详情页、详情页图片渲染。

## 18. 关键风险

- 当前部分核心数据接口仍依赖旧分页路径兼容读取，前台正式上线前必须完成后端只读公开接口。
- 后端文档存在编码显示问题，后续应统一为 UTF-8，避免中文字段说明和接口文档不可读。
- 图片来源跨多个域名，必须提前处理远程图片白名单、防盗链、缓存和失败占位图。
- 皮肤、系列、宇宙之间存在逗号分隔 ID 集合，需推进服务端或数据层归一化。

## 19. 待确认问题

- `/skins` 皮肤列表按上线时间、皮肤品质、皮肤徽章分组时，各分组的默认排序、分页方式和 SEO 索引策略待确认。
- Header 全局搜索结果的接口返回字段、排序规则、分组规则和空状态文案待确认。
- 神话商店页面的缓存时间是否完全由商品结束时间决定，还是需要后端提供统一刷新时间。
- 臻彩藏品页是否需要独立详情页或仅列表聚合页。
- 图片代理 `/api/image-proxy` 的允许域名清单和失败占位策略。
- TeamCity CI/CD 的实际包管理器使用 `npm`、`pnpm` 还是按环境统一配置。

## 20. 英雄详情页已确认调整

- 英雄详情页需要支持明暗模式，不能只按单一暗色视觉实现。
- 英雄中文称号和中文名称同一行展示，中文称号字号小于中文名称；复制中文主标题时格式为“称号 名称”。
- 英雄描述需要完整展示，并提供复制描述内容的按钮。
- 英雄定位、位置展示字典文本值，不直接展示后端编码值；英雄主信息区域不展示额外小头像。
- 皮肤列表默认按发布时间升序排序；没有可靠发布时间时可用皮肤 ID 顺序作为发布时间先后近似。
- 点击当前排序项时在升序和降序之间切换。
- 皮肤列表支持按皮肤品质升序/降序排序，品质值越大代表品质越高。
- 英雄基本信息区域和皮肤列表区域之间需要有分割线。
- 皮肤卡片的品质图标展示在皮肤名称前面。
- 桌面端皮肤列表一行展示 6 列，移动端按可用宽度降级为多列/双列布局。

## 21. 英雄详情页一期完成记录

- 完成时间：2026-06-05。
- `/champions/[championId]` 已按一期要求完成服务端渲染详情页，首屏输出英雄基本资料、描述、皮肤列表、metadata、canonical、Open Graph 与 JSON-LD。
- 英雄详情背景图使用基础皮肤的 `splashPath`，基础皮肤优先按 `Skin.isBase = 1` 判断。
- 页面支持明暗模式；中文主标题按“称号 名称”展示，英文标题按“称呼 名称”展示，导航末级同步显示完整中文称号名称。
- 复制交互改为文本末尾行内图标效果，复制成功后图标切换为勾选反馈；中文标题复制入口位于导航末级，英文标题与描述支持各自复制。
- 英雄定位、位置展示字典文本值；英雄主信息区不展示额外小头像。
- 皮肤列表默认按发布时间升序排序，缺少发布时间时使用皮肤 ID 顺序近似；发布时间与皮肤品质均支持升序/降序切换。
- 皮肤列表桌面端一行 6 列，皮肤名称前展示品质图标，鼠标悬停可查看完整名称。
- 新增可复用 `SkinEmblems` 徽章组件，徽章图片使用 CommunityDragon 中文资源地址，默认按原图等比例显示，并在皮肤图片底部居中叠加展示。
- 前端新增读取后端公开英雄详情接口 `GET /rest/lol/champions/{heroId}`；后端已补充对应只读接口，返回单个英雄详情数据。
- 本期验证范围：前端 `npm run lint`、`npm run build`；后端 `mvn -pl admin -DskipTests -Dspring-javaformat.skip=true compile`。
