# Skin Hub 一期开发报告

## 完成范围

- 搭建 Next.js App Router + TypeScript 前端工程。
- 完成首页 `/`：最新皮肤、英雄入口、皮肤系列、皮肤宇宙聚合展示。
- 完成皮肤详情页 `/skins/[skinId]`：服务端渲染皮肤主体信息、原画、加载图、基础信息和系列信息。
- 补充轻量皮肤检索页 `/skins`，避免首页搜索入口断链。
- 增加 SEO 基础能力：Metadata、canonical、Open Graph、JSON-LD、`robots.ts`、`sitemap.ts`。
- 增加后端数据访问封装，默认读取 `BACKEND_BASE_URL`；页面只渲染真实接口结果，接口不可用时显示空状态。
- 首页“最新新增皮肤”使用 `isPbeOnly=1` 查询 PBE-only 皮肤列表。
- 样式按 README 技术选型调整为 `tailwindcss` + CSS Modules；明暗模式改为 `next-themes` class 策略，默认暗色并支持系统偏好。

## 主要文件

- `src/app/page.tsx`
- `src/app/page.module.css`
- `src/app/skins/page.tsx`
- `src/app/skins/[skinId]/page.tsx`
- `src/components/theme/theme-provider.tsx`
- `src/components/layout/site-header.tsx`
- `src/lib/api/backend-client.ts`
- `src/types/lol.ts`
- `src/styles/globals.css`

## 环境变量

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BACKEND_BASE_URL=http://localhost:9527
```

## 验证命令

```bash
npm run lint
npm run build
```

## 后续建议

- 后端补齐 README 中列出的只读公开接口后，替换示例数据路径即可进入真实数据联调。
- 二期优先补 `/skins` 检索页，并将英雄、系列、宇宙详情页打通为完整内部链接网络。
