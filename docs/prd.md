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

## 22. 皮肤详情页调研需求

调研参考页：`https://splash.buguoguo.cn/champions/ahri/skins/103086`。

### 22.1 页面目标与路由

- 皮肤详情页继续使用 `/skins/[skinId]` 作为本站正式路由，遵循“稳定 ID + 可读 slug”规则；参考页的 `/champions/{championKey}/skins/{skinId}` 仅作为信息架构参考。
- 页面需要作为可索引详情页承载皮肤主体内容，首屏服务端输出皮肤名称、所属英雄、描述、主视觉原画、基础标签、所属系列/宇宙等信息。
- 页面体验以皮肤原画查看为核心，详情信息作为覆盖层或信息区辅助展示；不能做成只有静态资料卡、弱化原画的页面。

### 22.2 首屏信息架构

- 顶部需要提供返回所属英雄详情页的入口，展示英雄中文称号或名称，例如“九尾妖狐”。
- 主标题展示皮肤中文名，例如“联盟不朽 阿狸”。
- 标题前展示皮肤品质图标；品质图标文案使用字典名称，例如“卓越”，不直接展示后端编码。
- 标题区域需要提供详情说明入口或信息展开入口，用于查看所属英雄、宇宙、系列、描述和外部资源链接；桌面端优先使用悬浮信息入口并展开为右侧面板，移动端使用底部抽屉。
- 主视觉优先展示未裁切原画 `uncenteredSplashPath`；需要支持切换聚焦原画 `splashPath` 与未裁切原画。
- 页面背景可使用同一张未裁切原画做铺底，叠加暗色遮罩或毛玻璃，保证标题、导航和控件可读；页面仍支持明暗模式，但皮肤详情页主基调固定为深色遮罩，浅色模式只影响面板和文字层级。

### 22.3 图片与查看交互

- 原画查看区需要支持“适应屏幕/填充屏幕”切换，参考页对应控件为“填充屏幕 (Z)”。
- 原画查看区需要支持“聚焦/原画”切换，参考页对应控件为“切换聚焦/原画 (C)”。
- 切换聚焦/原画或静态/动态原画时，背景层与主展示层同步切换；切换炫彩只替换主展示层，背景层仍使用原皮对应模式的资源。
- 当当前皮肤存在动态原画资源时，页面默认优先展示动态原画；切换到没有动态资源的原皮或炫彩时自动回退为静态原画。
- 进入页面默认展示未裁切原画，用户可手动切换到聚焦原画。
- 原画查看区需要提供下载入口，直接下载当前查看的远程原画图片，参考页对应控件为“下载 (D)”。
- 原画查看区四角操作区统一使用 shadcn `ButtonGroup` + `Button` 的 `ghost` 形态，按钮组贴近屏幕边缘展示，圆角使用组件默认样式；四个角的按钮视觉统一通过同一套半透明深色按钮样式管理，各按钮自身 class 只负责布局差异。页面文字按钮统一使用 small 尺寸 `sm`，纯图标按钮使用按钮组件已有的 `icon` 尺寸，按钮内图标通过 `data-icon` 交给 shadcn Button 规则处理，不额外修改图标大小。按钮亮度分三档：鼠标或键盘 2 秒无活动时最暗，页面有鼠标或键盘活动时第二亮，按钮 hover 时最亮，且 hover 时文字与图标需要有更明显的高亮层次。
- 左上按钮组展示返回英雄入口。右上按钮组展示视图、媒体、下载与详情操作；最后一项为“皮肤品质图标 + 皮肤名称 + 详情图标”的整体按钮，点击打开详情。右上详情按钮需要与同组视图、媒体、下载等图标按钮保持一致高度。页面不为按钮额外定义自定义字号，按钮字体表现统一由 shadcn `Button` 的 `size` 样式决定。
- 静态/动态原画切换按钮需要展示可切换到的目标状态图标：当前展示静态原画时显示视频图标，当前展示动态原画时显示图片图标。
- 如果后端返回动画原画资源，例如 `splashVideoPath`、`collectionSplashVideoPath`、`collectionCardHoverVideoPath`，页面可预加载或作为后续增强展示；首期不强制自动播放。
- 图片资源继续复用 `src/lib/images` 的 CommunityDragon/CDN 处理逻辑，不新增独立拼接分支；新增远程域名时同步检查 `next.config.ts`。
- 主图 `alt` 使用皮肤名称；Open Graph 图片优先使用未裁切原画或主原画。

### 22.4 关联信息与详情内容

- 信息区需要展示并可跳转到所属英雄详情页。
- 信息区需要展示所属宇宙并可跳转到宇宙详情页；参考页示例为“名人堂”。
- 信息区需要展示所属皮肤系列并可跳转到系列详情页；参考页示例为“殿堂传奇”。
- 信息区需要展示皮肤描述；缺失时展示明确占位内容，不隐藏信息块。
- 信息区需要展示基础信息：皮肤 ID、英雄 ID/英雄名称、英文名、全局稀有度、国服品质、限定状态、PBE 状态、上线时间。
- 标签与图标展示使用字典文本和字典图标，避免直接暴露 `kTranscendent`、`regionRarityId` 等原始值。

### 22.5 上一款/下一款导航

- 皮肤详情页需要提供同英雄皮肤的上一款/下一款导航。
- 上一个/下一个皮肤按钮固定在页面底部两侧，参考页左下为上一个、右下为下一个，使用按钮组样式。
- 导航项仅展示相邻皮肤名称和方向图标，不显示“上一款”“下一款”文案，并跳转到对应皮肤详情页。
- 默认顺序按发布时间升序；缺少可靠发布时间时使用皮肤 ID 顺序近似，与英雄详情页皮肤列表规则保持一致。
- 当前皮肤位于首尾时，对应方向可隐藏或置为不可用状态，避免跳转空链接。

### 22.6 外部资源入口

- 当数据可用时，信息区可展示外部资源入口：
  - 英雄语音站链接，按英雄维度跳转。
  - 皮肤演示视频链接，按皮肤名称搜索或按后端返回 URL 跳转。
  - 3D 模型链接，按皮肤 ID 跳转。
- 外部链接必须使用新窗口打开，并带 `rel="noreferrer"`。
- 外部资源入口属于增强内容；缺失时不影响页面主体可用性。
- 外部资源入口放在详情面板中作为次要入口，不在首屏直接暴露为常驻主按钮，避免干扰原画查看。

### 22.7 炫彩与皮肤增强内容

- 如果皮肤详情返回 `chromasJson` 或结构化 `chromas`，页面需要展示炫彩列表。
- 炫彩列表展示在页面底部居中区域，以缩略图栏形式呈现；鼠标移入底部分页器时显示，鼠标移出分页器和缩略图栏范围后隐藏，并与底部两侧上一款/下一款按钮共存。
- 炫彩缩略图第一个固定为当前原皮，后面依次展示该皮肤的炫彩。
- 炫彩项展示炫彩图、名称、颜色色板和描述；有稀有度或来源说明时一并展示。原皮与炫彩缩略图优先使用 `chromaPath`，缺失时依次使用 `loadScreenVintagePath`、`loadScreenPath`，缩略图容器尺寸固定为 270×303，图片完整显示且不裁剪。
- 炫彩颜色统一使用全局通用的图片式圆形色板组件展示，原皮或无颜色时显示斜杠圆形图片，单色为实心圆，多色为分区圆形图片；色值需要去重，`ChromaColorSwatch` 组件内置 Popover 展示颜色值并支持复制。Popover 使用 hover 打开，复制色值后保持显示，离开色板与 Popover 区域后隐藏；鼠标移入色值 Popover 时底部轮播栏需要保持显示。缩略图中的色板需要更醒目并在缩略图底部居中展示。
- 点击炫彩缩略图在当前页面内替换主视觉图片或视频，不跳转到新的详情页。
- 炫彩缩略图栏内容未超出容器宽度时静态居中展示；超出容器宽度时使用前端 UI 组件库的 Carousel/Embla 轮播能力无限 loop，不自动滚动，在轮播栏两端展示切换按钮，并支持鼠标滚轮切换上一组/下一组；轮播最大宽度以完整展示 3 个 270×303 缩略图为准，卡片间距使用 `gap` 控制，并保留左右等距留白；展示组件整体居中；底部中间常显与轮播项数量一致的色板索引并贴近屏幕底部边缘，使用 shadcn `ButtonGroup` + `Button` 的 `outline` 形态和 `sm` 尺寸，外层不展示额外背景容器；分页按钮视觉与页面其他操作按钮一致，跟随鼠标闲置、活动和 hover 三档亮度；色板不拆分颜色、不显示 Popover，点击色板可切换对应原皮或炫彩，并同步将对应缩略图移动到轮播中间，不能遮挡轮播底部皮肤名称。
- 轮播底部皮肤名称需要居中展示，字号大于辅助说明文字；名称 hover 时使用 Popover 展示完整名称，并提供复制按钮。
- 如果返回 `skinAugments`，页面需要为后续展示边框、签名版叠层、特殊叠图预留数据结构；首期可先不渲染复杂叠层，但不能丢失接口字段设计。

### 22.8 SEO 与结构化数据

- 皮肤详情页需要生成唯一 `title`、`description`、`canonical`、Open Graph 图片和 Open Graph 描述。
- `description` 优先使用皮肤描述，缺失时使用“皮肤名 + 英雄名 + 稀有度/系列/上线时间”的描述模板。
- 页面继续输出 `ImageObject` 与 `BreadcrumbList` JSON-LD。
- 面包屑至少包含：首页、皮肤、当前皮肤；如果英雄详情页和系列详情页已稳定，可在可见导航中提供对应入口。

### 22.9 移动端与可访问性

- 移动端首屏仍以原画为主体，标题和关键控件不能遮挡皮肤主体区域。
- 图标按钮可点击区域不小于 44×44px，并提供 `aria-label` 或 `title`。
- 信息展开区在移动端可使用底部抽屉或浮层，但主体信息必须仍可通过服务端 HTML 被索引。
- 控件文案、品质、系列、宇宙、英雄名称需要有文本输出，不能只依赖图标或图片。

### 22.10 数据与接口待补齐

- `GET /rest/lol/skins/{riotSkinId}` 需要返回所属英雄详情摘要，至少包含 `heroId`、`name`、`title`、`alias` 或可生成英雄详情 URL 的字段。
- 皮肤详情接口需要返回结构化所属系列列表，而不仅是逗号分隔 ID；至少包含系列 ID、名称、英文名。
- 皮肤详情接口需要返回结构化所属宇宙列表；至少包含宇宙 ID、名称、英文名、描述或图片。
- 皮肤详情接口需要返回同英雄相邻皮肤信息，或前端可通过 `championId` 拉取同英雄皮肤列表后计算上一款/下一款。
- 皮肤详情接口需要明确 `chromasJson` 的结构化格式；如果后端能直接返回 `chromas` 数组，前端优先使用结构化数组。

## 23. 皮肤宇宙列表页调研需求

调研参考页: https://splash.buguoguo.cn/universes。

### 23.1 页面目标与路由

- 宇宙列表页使用 /universes 路由，当前已落地入口页（复用首页聚合入口组件），在已有页面上直接迭代升级。
- 页面作为可索引列表页承载全部宇宙的浏览入口，首屏服务端输出宇宙及其关联系列列表。
- 目标是让用户快速浏览所有皮肤宇宙，了解每个宇宙包含的皮肤套装，并可通过入口跳转到宇宙详情页。

### 23.2 首屏信息架构

- 页面顶部提供面包屑导航，示例如"首页 > 皮肤宇宙"。
- 页面标题展示"皮肤宇宙"作为主标题。
- 标题区域提供排序控件：按名称排序（升序/降序）、按套装数量排序（升序/降序）。
- 主内容区采用**瀑布流（Masonry/Waterfall）卡片布局**，每列高度自适应：
  - 每个宇宙作为一个瀑布流卡片（Card）。
  - 卡片顶部展示宇宙代表图（宽高比 2:1 缩略图）+ 宇宙中文名称 + 英文名。
  - 点击宇宙代表图或名称跳转到宇宙详情页 /universes/[universeId]。
  - 卡片内部使用 **File Tree**（shadcn TreeFolder/TreeFile）列出该宇宙下的全部皮肤系列（Skinline）。
  - 点击系列子项可跳转到对应系列详情页 /skinlines/[skinlineId]。
- 瀑布流通过 CSS columns 实现：桌面端 3 列、平板 2 列、移动端 1 列，[column-fill: balance] 使各列高度均衡。
- 页面不使用背景图装饰，以纯色/简洁背景展示内容。

### 23.3 列表加载与分页

- 宇宙数量通常较少（预计不超过 30-50 个），首期可直接全量加载，不需要分页。
- 如果后续宇宙数量增多，可按需引入分页或无限滚动。
- 列表数据在服务端获取，首屏即输出 HTML，SEO 友好。

### 23.4 排序

- 页面提供排序功能，通过下拉菜单或按钮组切换：
  - 按宇宙名称排序：支持升序/降序。
  - 按关联系列（套装）数量排序：支持升序/降序。
- 排序在客户端或服务端完成均可；如果数据量小，客户端排序即可。

### 23.5 宇宙列表与首页聚合的关系

- 当前 /universes 复用首页的 HomeContent 组件，仅展示了与首页聚合相同的宇宙入口。
- 迭代后，宇宙列表页直接在现有页面上改造，升级为独立展示组件。
- 首页聚合区的"皮肤宇宙"入口可保持不变，继续引用宇宙列表页路由。

### 23.6 SEO 与结构化数据

- 页面需要生成唯一 	itle、description、canonical、Open Graph 信息。
- 	itle 示例如"皮肤宇宙 - Skin Hub"，description 使用概括性描述。
- 页面输出 CollectionPage JSON-LD。
- 面包屑至少包含：首页、皮肤宇宙。
- 页面需要收录到 sitemap.xml 中。

### 23.7 移动端与可访问性

- 桌面端与移动端均使用文件树结构，移动端保持树节点的可点击区域不小于 44×44px。
- 树节点文字和控件需要有文本输出，不能只依赖图标或图片。
- 展开/折叠交互在移动端可通过点击整行触发。

### 23.8 数据与接口待补齐

- GET /rest/lol/universes 列表接口需要确认返回字段:
  - 宇宙基本信息: id、lolUniverseId、
ame、engName、imagePath。
  - 关联系列列表: 至少包含系列 ID、名称、英文名。
  - 每个关联系列关联的皮肤数量（可选）。
- 如果宇宙列表接口返回的数据不含关联系列信息，前端可通过 GET /rest/lol/skinlines 接口按宇宙 ID 过滤或全量加载后进行客户端关联。
- 系列代表图（File Tree 子项图片降级）需要确认是否可从现有系列列表接口获取。

### 23.9 已确认产品决策

- 宇宙列表页在现有 /universes 路由上直接迭代，路由不变。
- 页面不使用背景图装饰。
- 主内容采用 shadcn File Tree 样式展示，每个宇宙为树节点，默认全部展开。
- 每个宇宙节点下列出该宇宙所属的皮肤系列。
- 排序支持按名称和按套装数量两种维度。
- 图片资源继续复用 src/lib/images 的 CommunityDragon/CDN 处理逻辑，新增远程域名时同步检查 
ext.config.ts。
- 列表数据全量服务端获取，首屏 SSR 输出。

### 23.10 待确认问题

- 宇宙代表图 imagePath 的后端填充率和图片质量，是否需要降级方案（如使用该宇宙下第一个系列的图片）。
- 系列代表图在 File Tree 子项中是否需要展示小图，还是仅展示文字即可。
- 按套装数量排序时，套装数量是指"关联系列数"还是"关联皮肤总数"。
- 宇宙列表是否只展示有关联系列的宇宙，还是展示所有宇宙（无系列宇宙显示空子树）。

### 23.11 全局共享的 Tab 导航架构

- /、/universes、/skinlines、/coming 四个页面共享同一套 HomeTabs 组件作为全局 tab 导航。
- 页面结构统一为：
  1. **PBE 新增**：全局固定区域，不随 tab 切换而变化，展示于首页 HomeContent 顶部。
  2. **Tab 导航条**：使用 shadcn Tabs 组件（TabsList + TabsTrigger asChild + Link）实现路由级切换，URL 随 tab 变化。
  3. **Tab 内容区**：各 tab 内容包裹在 TabsContent + Card + CardContent 中。
- 各 tab 路由与内容对应关系：

  | 路由 | tab | 内容组件 |
  |------|-----|---------|
  | / 或 /champions | 英雄 | 英雄列表 + 筛选 |
  | /universes | 皮肤宇宙 | UniversesTree（瀑布流卡片 + 内部 File Tree） |
  | /skinlines | 皮肤套装 | 系列卡片网格 |
  | /coming | 后续内容 | 占位卡片 |

- HomeTabs 通过 activeTab prop 从 HomeContent 接收当前激活的 tab，Tabs defaultValue 跟随 activeTab 使初始化状态正确。
- 此架构确保所有列表页的首屏 SSR 输出、SEO 元数据和面包屑导航的一致性，并通过 HomeContent 统一管理 PBE 新增数据与 tab 数据的拉取。
