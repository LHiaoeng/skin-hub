# 臻彩独立详情页设计

## 目标与范围

为国服臻彩建立独立、可索引的详情页。页面复用现有皮肤详情的全屏原画查看体验，并在详情抽屉中提供臻彩专属正文和关联信息。本次只包含臻彩详情页，不包含首页 Tab 或臻彩藏馆列表页改造。

## 路由契约

- 正式路由为 `/prestige-chromas/{skinId}-{slug}`。
- `skinId` 来自 `PrestigeChroma.skinId`，同时等于对应 `SkinChroma.id`，是臻彩页面稳定主键。
- `slug` 由 `itemName` 生成，只用于可读性。
- 服务端以 `skinId` 查找实体；slug 不匹配时永久重定向到规范 URL。
- `/skins/{riotSkinId}-{slug}?chroma={chromaId}` 保留为皮肤页内展示状态，不作为臻彩详情 canonical。

## 数据契约

臻彩身份只能由 `GET /rest/lol/prestige-chromas` 确定，不根据名称推断。页面使用以下字段：

- 身份与排序：`skinId`、`instanceId`、`rank`
- 展示：`itemName`、`cid`、`cname`、`timgUrl`
- 英雄：`heroId`、`heroName`
- 时间：`startTime`、`startDate`、`endTime`
- 关联：`skinLines`、`universes`

接口成功但没有对应记录时返回 404。相同 `skinId` 出现多条记录时抛出数据契约错误，不能随机选择。接口请求失败与实体不存在必须保持不同的失败语义。

## 页面架构

### 服务端页面

动态路由服务端获取臻彩列表并按 `skinId` 唯一匹配，生成规范跳转、metadata、JSON-LD 和查看器属性。可静态生成已知臻彩参数，并使用项目现有 ISR 策略更新。

### 全屏查看器

局部通用化现有 `SkinDetailViewer`，使其能够接收臻彩页面标题、详情项、关联链接、主视觉和相邻页面导航。皮肤详情现有行为不变，不复制第二套全屏查看器。

臻彩主视觉使用：

`https://game.gtimg.cn/images/lol/act/a20230715chromahub/skin/site3-{instanceId}.jpg`

`instanceId` 缺失时不构造 URL，查看器显示明确的图片不可用状态，但详情正文仍可访问。

### 详情抽屉

详情抽屉在服务端输出以下真实内容：

- `itemName` 与根据已有字段组合的简介
- 英雄名称
- 臻彩 ID 与分类
- 上线时间
- 所属皮肤系列
- 所属宇宙

缺失内容直接省略。英雄、系列和宇宙只有在能映射到本站稳定实体 ID 时才生成链接，否则保留纯文本。

### 相邻导航

按 `rank` 对臻彩排序，提供上一款和下一款臻彩入口。相同 `rank` 使用 `skinId` 作为稳定的次级排序键。

## SEO

- title：`{itemName}臻彩原画与资料`
- description：由英雄、分类、系列、宇宙和上线时间组合，避免无依据文案。
- canonical：当前臻彩规范详情 URL。
- Open Graph：使用臻彩标题、描述和主视觉。
- JSON-LD：输出臻彩 `ImageObject` 和包含首页、臻彩藏馆、当前臻彩的 `BreadcrumbList`。
- sitemap：收录所有规范臻彩 URL，优先使用有效上线时间作为 `lastModified`。

页面服务端 HTML 必须包含臻彩名称和详情正文，不能只依赖客户端视觉切换或 metadata 形成页面差异。

## 错误处理

- 非法路由 ID 或不存在的臻彩：404。
- 非规范 slug：永久重定向。
- 接口失败：请求或构建明确失败，不伪装成 404。
- 重复 `skinId`：数据契约错误。
- 图片字段缺失：正文保留，图片区域显示不可用状态。
- 关联实体无法映射：显示纯文本，不生成错误链接。

## 验收标准

- 规范 URL 可直接访问并在首屏显示正确臻彩原画和名称。
- 非规范 slug 永久重定向到规范 URL。
- 不存在的 ID 返回 404，接口失败不会错误返回 404。
- 服务端 HTML 包含臻彩名称、英雄、可用的系列、宇宙和时间正文。
- 每个臻彩输出独立 title、description、自引用 canonical、Open Graph 和 JSON-LD。
- sitemap 包含全部规范臻彩详情 URL。
- 上一款和下一款按 `rank` 稳定跳转。
- 原皮详情页所有现有交互保持不变。
- 桌面与移动端均可阅读详情抽屉的核心内容。

## 验证策略

- 为臻彩路由构造与解析、唯一匹配、排序、description 组合增加定向测试。
- 覆盖正常记录、缺失记录、重复 ID、非法 ID、非规范 slug 和图片缺失。
- 执行 `npm run lint` 与 `npm run build`。
- 实际访问规范 URL、错误 slug 和不存在 ID，检查状态、跳转、服务端 HTML、canonical、Open Graph、JSON-LD 与移动端布局。
