# 臻彩独立详情页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增可索引的臻彩独立详情页，复用现有全屏皮肤查看器，并完成稳定路由、SEO、结构化数据、sitemap 和验证。

**Architecture:** `/rest/lol/prestige-chromas` 是臻彩身份唯一事实源；纯数据校验、唯一匹配、排序和文案组合放入独立领域模块。Next.js 动态路由在服务端完成实体解析、规范 slug 跳转和 SEO 输出，现有 `SkinDetailViewer` 只做必要的内容标签与详情分组通用化，皮肤详情默认行为保持不变。

**Tech Stack:** Next.js 16 App Router、React 19、TypeScript strict、Node test runner、shadcn/Radix Drawer、Schema.org JSON-LD。

---

> 仓库规则要求未获明确指令时不执行 Git commit，因此本计划省略提交步骤；每个任务完成后仍检查定向 diff。

### Task 1: 臻彩领域契约与纯逻辑

**Files:**

- Modify: `src/types/lol.ts`
- Create: `src/lib/lol/prestige-chroma.ts`
- Create: `tests/prestige-chroma.test.mjs`
- Modify: `package.json`

- [ ] **Step 1: 写失败测试，定义接口解包、唯一匹配、重复 ID、排序、图片和描述行为**

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  buildPrestigeChromaDescription,
  getPrestigeChromaImageUrl,
  parsePrestigeChromaList,
  resolvePrestigeChroma,
  sortPrestigeChromas,
} from "../src/lib/lol/prestige-chroma.ts";

const ahri = {
  heroId: 103,
  heroName: "阿狸",
  skinId: 1234,
  itemName: "灵魂莲华 阿狸 臻彩",
  instanceId: "ahri-1234",
  rank: 2,
  startDate: "2026-06-01",
  cid: "legacy",
  cname: "典藏臻彩",
  skinLines: [{ id: 40, name: "灵魂莲华", description: "" }],
  universes: [{ id: 12, name: "灵魂莲华宇宙", description: "" }],
};

test("parses wrapped prestige chroma data", () => {
  assert.deepEqual(parsePrestigeChromaList({ code: 200, data: [ahri] }), [
    ahri,
  ]);
});

test("resolves exactly one prestige chroma", () => {
  assert.equal(resolvePrestigeChroma([ahri], 1234), ahri);
  assert.equal(resolvePrestigeChroma([ahri], 9999), undefined);
});

test("rejects duplicate prestige chroma ids", () => {
  assert.throws(
    () => resolvePrestigeChroma([ahri, { ...ahri }], 1234),
    /Duplicate prestige chroma skinId 1234/,
  );
});

test("sorts by rank and then skinId", () => {
  const sorted = sortPrestigeChromas([{ ...ahri, skinId: 1235 }, ahri]);
  assert.deepEqual(
    sorted.map((item) => item.skinId),
    [1234, 1235],
  );
});

test("builds image only when instanceId exists", () => {
  assert.equal(
    getPrestigeChromaImageUrl(ahri),
    "https://game.gtimg.cn/images/lol/act/a20230715chromahub/skin/site3-ahri-1234.jpg",
  );
  assert.equal(
    getPrestigeChromaImageUrl({ ...ahri, instanceId: "" }),
    undefined,
  );
});

test("builds description from real fields", () => {
  assert.match(buildPrestigeChromaDescription(ahri), /阿狸/);
  assert.match(buildPrestigeChromaDescription(ahri), /典藏臻彩/);
  assert.match(buildPrestigeChromaDescription(ahri), /2026-06-01/);
});
```

- [ ] **Step 2: 运行测试并确认因模块不存在而失败**

Run: `node --test --experimental-strip-types tests/prestige-chroma.test.mjs`

Expected: FAIL，错误包含 `ERR_MODULE_NOT_FOUND`。

- [ ] **Step 3: 增加 `PrestigeChroma` 类型和最小领域实现**

```ts
export interface PrestigeChromaRelation {
  id: number;
  name: string;
  description?: string;
}

export interface PrestigeChroma {
  heroId: number;
  heroName: string;
  skinId: number;
  itemName: string;
  instanceId?: string;
  rank: number;
  startTime?: string;
  endTime?: string;
  startDate?: string;
  cid?: string;
  cname?: string;
  timgUrl?: string;
  skinLines: PrestigeChromaRelation[];
  universes: PrestigeChromaRelation[];
}
```

`parsePrestigeChromaList` 必须接受裸数组和 `{ code, data }` 包装，拒绝非数组、业务失败码及缺少合法 `skinId/itemName` 的记录。`resolvePrestigeChroma` 必须区分未找到与重复 ID；排序不得修改输入数组；描述只组合存在的真实字段。

- [ ] **Step 4: 增加定向测试脚本并验证通过**

```json
"test:prestige": "node --test --experimental-strip-types tests/prestige-chroma.test.mjs"
```

Run: `npm.cmd run test:prestige`

Expected: PASS，全部臻彩领域测试通过。

### Task 2: 严格臻彩 API 与路由构造

**Files:**

- Modify: `src/lib/api/backend-client.ts`
- Modify: `src/lib/routing/slug.ts`
- Modify: `tests/prestige-chroma.test.mjs`

- [ ] **Step 1: 写失败测试定义臻彩规范路径**

```js
import { prestigeChromaPath } from "../src/lib/routing/slug.ts";

test("builds prestige chroma path from stable id and item name", () => {
  assert.equal(
    prestigeChromaPath(ahri),
    "/prestige-chromas/1234-灵魂莲华-阿狸-臻彩",
  );
});
```

臻彩接口没有英文名称，路径函数需要使用只服务于臻彩路由的 Unicode slug 规则：保留各语言字母和数字，将其他连续字符压缩为 `-`。不得修改现有皮肤、英雄、系列和宇宙的 ASCII slug 行为。

- [ ] **Step 2: 运行测试并确认导出不存在**

Run: `npm.cmd run test:prestige`

Expected: FAIL，提示 `prestigeChromaPath` 未导出。

- [ ] **Step 3: 实现路径和严格 API**

```ts
export function prestigeChromaPath(chroma: {
  skinId: number;
  itemName: string;
}): string {
  const slug = chroma.itemName
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return `/prestige-chromas/${chroma.skinId}-${slug || "unknown"}`;
}
```

在 `backend-client.ts` 增加 `getPrestigeChromas()`。它请求 `/rest/lol/prestige-chromas`，HTTP 非成功、JSON 解析失败或业务契约错误时抛出明确异常，成功时交给 `parsePrestigeChromaList`；不得复用当前会把网络错误折叠成 `undefined` 的宽松 `request()`。

- [ ] **Step 4: 运行领域测试与 TypeScript 构建检查**

Run: `npm.cmd run test:prestige`

Expected: PASS。

Run: `npm.cmd run build`

Expected: PASS，或只暴露后续页面尚未接入导致的预期错误；不得有新类型契约错误。

### Task 3: 查看器局部通用化

**Files:**

- Modify: `src/app/skins/[skinId]/skin-detail-viewer.tsx`

- [ ] **Step 1: 扩展查看器属性，不改变皮肤页默认值**

新增可选属性：

```ts
contentKind?: "skin" | "prestige-chroma";
primaryDetailsTitle?: string;
secondaryDetailsTitle?: string;
seoSummary?: string;
```

默认值必须保持 `skin`、`国服`、`直营服` 和当前皮肤摘要行为。

- [ ] **Step 2: 用属性替换硬编码标签并省略空分组**

臻彩模式下：

```tsx
<section className={styles.hiddenSeo} aria-label="臻彩详情正文">
  <h2>{skinName}</h2>
  <p>{description}</p>
  <p>{seoSummary}</p>
</section>
```

`globalDetails` 为空时不渲染第二个 `DetailCollapsible`。皮肤模式继续输出原有标签、内容和交互。

- [ ] **Step 3: 执行 lint 和皮肤页构建回归**

Run: `npm.cmd run lint`

Expected: PASS。

Run: `npm.cmd run build`

Expected: PASS，现有 `/skins/[skinId]` 可生成。

### Task 4: 臻彩详情服务端页面与 SEO

**Files:**

- Create: `src/app/prestige-chromas/[prestigeChromaId]/page.tsx`
- Modify: `src/lib/seo/schema.ts`

- [ ] **Step 1: 写失败测试定义通用图片 Schema**

在 `tests/prestige-chroma.test.mjs` 中断言新的纯函数输出 `ImageObject` 名称、图片 URL、页面 URL 和描述；运行测试确认 `imageObjectSchema` 尚未导出。

- [ ] **Step 2: 实现通用 `imageObjectSchema` 并保持皮肤 Schema 兼容**

```ts
export function imageObjectSchema({
  name,
  imageUrl,
  pageUrl,
  description,
}: {
  name: string;
  imageUrl?: string;
  pageUrl: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name,
    contentUrl: imageUrl,
    url: pageUrl,
    description,
  };
}
```

`skinImageSchema` 改为调用它，确保现有输出字段不变。

- [ ] **Step 3: 创建动态详情页**

页面必须实现：

```ts
export const revalidate = 86400;

export async function generateStaticParams() {
  return (await getPrestigeChromas()).map((item) => ({
    prestigeChromaId: prestigeChromaPath(item).replace(
      "/prestige-chromas/",
      "",
    ),
  }));
}
```

`generateMetadata` 和页面主体都按路由 ID 唯一解析臻彩。主体检测非规范 segment 后调用 `permanentRedirect(prestigeChromaPath(item))`。查看器属性使用臻彩名称、图片、分类、英雄、时间、系列、宇宙和稳定的前后导航；关联实体通过现有 `getChampion/getSkinlines/getUniverses` 映射，无法映射时保留文本详情但不生成错误链接。

- [ ] **Step 4: 输出独立 SEO**

metadata 必须包含：

```ts
{
  title: `${item.itemName}臻彩原画与资料`,
  description,
  alternates: { canonical: prestigeChromaPath(item) },
  openGraph: {
    title: `${item.itemName}臻彩原画与资料`,
    description,
    images: imageUrl ? [{ url: imageUrl, alt: `${item.itemName}臻彩原画` }] : undefined,
  },
}
```

页面输出臻彩 `ImageObject` 与首页、臻彩藏馆、当前臻彩三级 `BreadcrumbList`。

- [ ] **Step 5: 运行测试、lint 和 build**

Run: `npm.cmd run test:prestige && npm.cmd run lint && npm.cmd run build`

Expected: 全部 PASS，构建输出包含 `/prestige-chromas/[prestigeChromaId]`。

### Task 5: Sitemap 与端到端烟测

**Files:**

- Modify: `src/app/sitemap.ts`
- Modify: `docs/prd.md`（仅在实现行为与已确认文档有差异时修正）

- [ ] **Step 1: 将臻彩规范 URL 加入 sitemap**

并行获取 `getPrestigeChromas()`，为每条记录输出 `prestigeChromaPath(item)`；`lastModified` 优先使用合法 `startDate/startTime`，否则使用当前时间，`changeFrequency` 为 `monthly`，优先级低于皮肤详情。

- [ ] **Step 2: 完整自动验证**

Run: `npm.cmd run test:prestige`

Expected: PASS。

Run: `npm.cmd run lint`

Expected: PASS。

Run: `npm.cmd run build`

Expected: PASS。

- [ ] **Step 3: 启动生产服务并实际访问**

Run: `npm.cmd run start`

访问一个真实规范臻彩 URL，确认 HTTP 200、全屏原画、详情抽屉、title、description、canonical、Open Graph、JSON-LD 和隐藏 SEO 正文；访问错误 slug 确认永久重定向；访问不存在 ID 确认 404。移动端视口确认详情抽屉核心内容可读。

- [ ] **Step 4: 复查最终 diff**

Run: `git diff --check`、`git diff --stat`、`git diff`

确认没有覆盖用户未提交改动、没有名称推断臻彩、没有吞掉接口错误、没有生成错误关联链接，也没有把首页 Tab 纳入范围。
