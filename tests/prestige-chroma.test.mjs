import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPrestigeChromaDescription,
  fetchPrestigeChromas,
  getPrestigeChromaCardGroups,
  getPrestigeChromaCardImageUrl,
  getPrestigeChromaCardTitle,
  getPrestigeChromaCategoryOptions,
  getPrestigeChromaTagImageUrl,
  getPrestigeChromaImageUrl,
  getPrestigeChromaNavigation,
  filterPrestigeChromasForList,
  parsePrestigeChromaListOptions,
  parsePrestigeChromaList,
  resolvePrestigeChroma,
  sortPrestigeChromas,
} from "../src/lib/lol/prestige-chroma.ts";
import { contentSections } from "../src/lib/navigation/content-sections.ts";
import {
  buildPrestigeChromaSeo,
  prestigeChromaPath,
  resolvePrestigeChromaRoute,
} from "../src/lib/routing/slug.ts";
import { imageObjectSchema, skinImageSchema } from "../src/lib/seo/schema.ts";

const validItem = {
  heroId: 1,
  heroName: "阿狸",
  skinId: 9001,
  itemName: "灵魂莲华 阿狸 臻彩",
  instanceId: "abc123",
  rank: 2,
  startDate: "2026-06-22",
  cname: "臻彩",
  skinLines: [{ id: 10, name: "灵魂莲华" }],
  universes: [{ id: 20, name: "符文之地" }],
};

test("adds the prestige chroma artwork route to the home tabs", () => {
  assert.deepEqual(
    contentSections.map(({ key, label, href }) => ({ key, label, href })),
    [
      { key: "champions", label: "英雄", href: "/champions" },
      { key: "universes", label: "皮肤宇宙", href: "/universes" },
      { key: "skinlines", label: "皮肤套装", href: "/skinlines" },
      { key: "prestige-chromas", label: "臻彩原画", href: "/prestige-chromas" },
      { key: "coming", label: "后续内容", href: "/coming" },
    ],
  );
  assert.equal(
    contentSections.find((section) => section.key === "prestige-chromas")?.icon
      .displayName,
    "Palette",
  );
});

test("builds square prestige chroma card artwork from the site5 image source", () => {
  assert.equal(
    getPrestigeChromaCardImageUrl(validItem),
    "https://game.gtimg.cn/images/lol/act/a20230715chromahub/skin/site5-abc123.jpg",
  );
  assert.equal(
    getPrestigeChromaCardImageUrl({ ...validItem, instanceId: "  " }),
    undefined,
  );
});

test("builds the prestige chroma card tag image from timgUrl", () => {
  assert.equal(
    getPrestigeChromaTagImageUrl({
      ...validItem,
      timgUrl: " https://example.com/tag.png ",
    }),
    "https://example.com/tag.png",
  );
  assert.equal(
    getPrestigeChromaTagImageUrl({ ...validItem, timgUrl: "  " }),
    undefined,
  );
});

test("uses only the prestige chroma name as the card text", () => {
  assert.equal(getPrestigeChromaCardTitle(validItem), validItem.itemName);
});

test("parses prestige chroma list options with all rank desc defaults and category filters", () => {
  assert.deepEqual(parsePrestigeChromaListOptions(), {
    groupBy: "all",
    sortBy: "rank",
    order: "desc",
  });
  assert.deepEqual(
    parsePrestigeChromaListOptions({
      group: "universe",
      sort: "count",
      order: "asc",
      category: "dragon",
    }),
    {
      groupBy: "universe",
      sortBy: "count",
      order: "asc",
      categoryId: "dragon",
    },
  );
  assert.deepEqual(
    parsePrestigeChromaListOptions({ group: "bad", sort: "bad", order: "bad" }),
    {
      groupBy: "all",
      sortBy: "rank",
      order: "desc",
    },
  );
  assert.deepEqual(
    parsePrestigeChromaListOptions({
      group: "all",
      sort: "count",
      order: "asc",
      category: "dragon",
    }),
    {
      groupBy: "all",
      sortBy: "rank",
      order: "asc",
      categoryId: "dragon",
    },
  );
});

test("lists prestige chroma category options and filters by selected category", () => {
  const first = {
    ...validItem,
    skinId: 1,
    cid: "dragon",
    cname: "龙年限定",
    timgUrl: "https://example.com/dragon.png",
  };
  const duplicate = {
    ...validItem,
    skinId: 2,
    cid: "dragon",
    cname: "龙年限定",
  };
  const second = { ...validItem, skinId: 3, cid: "base", cname: "基础臻彩" };
  const missing = { ...validItem, skinId: 4, cid: undefined, cname: undefined };

  assert.deepEqual(
    getPrestigeChromaCategoryOptions([first, duplicate, second, missing]),
    [
      { id: "base", label: "基础臻彩", count: 1 },
      {
        id: "dragon",
        label: "龙年限定",
        count: 2,
        iconUrl: "https://example.com/dragon.png",
      },
    ],
  );
  assert.deepEqual(
    filterPrestigeChromasForList([first, duplicate, second, missing], {
      groupBy: "all",
      sortBy: "rank",
      order: "desc",
      categoryId: "dragon",
    }).map((item) => item.skinId),
    [1, 2],
  );
  assert.deepEqual(
    filterPrestigeChromasForList([first, second], {
      groupBy: "all",
      sortBy: "rank",
      order: "desc",
      categoryId: "missing",
    }),
    [],
  );
});

test("shows all prestige chromas as a single ungrouped section by default", () => {
  const lowRank = {
    ...validItem,
    skinId: 1,
    rank: 1,
    cid: "base",
    cname: "基础臻彩",
  };
  const highRank = {
    ...validItem,
    skinId: 2,
    rank: 3,
    cid: "dragon",
    cname: "龙年限定",
  };

  assert.deepEqual(
    getPrestigeChromaCardGroups([lowRank, highRank], {
      groupBy: "all",
      sortBy: "rank",
      order: "desc",
    }).map((group) => ({
      label: group.label,
      ids: group.items.map((item) => item.skinId),
    })),
    [{ label: "所有", ids: [2, 1] }],
  );
});

test("sorts prestige chroma groups by count when the count sort is selected", () => {
  const first = { ...validItem, skinId: 1, rank: 3, heroId: 1, heroName: "一" };
  const second = {
    ...validItem,
    skinId: 2,
    rank: 2,
    heroId: 2,
    heroName: "二",
  };
  const third = { ...validItem, skinId: 3, rank: 1, heroId: 2, heroName: "二" };

  assert.deepEqual(
    getPrestigeChromaCardGroups([first, second, third], {
      groupBy: "champion",
      sortBy: "count",
      order: "desc",
    }).map((group) => ({
      label: group.label,
      ids: group.items.map((item) => item.skinId),
    })),
    [
      { label: "二", ids: [2, 3] },
      { label: "一", ids: [1] },
    ],
  );
});

test("groups prestige chromas by universe and repeats multi-universe records", () => {
  const multiUniverse = {
    ...validItem,
    skinId: 1,
    universes: [
      { id: 20, name: "U20" },
      { id: 10, name: "U10" },
    ],
  };
  const missingUniverse = { ...validItem, skinId: 2, universes: [] };

  assert.deepEqual(
    getPrestigeChromaCardGroups([multiUniverse, missingUniverse], {
      groupBy: "universe",
      sortBy: "rank",
      order: "desc",
    }).map((group) => ({
      label: group.label,
      ids: group.items.map((item) => item.skinId),
    })),
    [
      { label: "U10", ids: [1] },
      { label: "U20", ids: [1] },
      { label: "\u672a\u5f52\u5c5e\u5b87\u5b99", ids: [2] },
    ],
  );
});

test("groups prestige chromas by skinline and champion", () => {
  const item = {
    ...validItem,
    skinId: 1,
    heroId: 103,
    heroName: "Ahri",
    skinLines: [
      { id: 30, name: "Line30" },
      { id: 10, name: "Line10" },
    ],
  };
  const missingSkinline = { ...validItem, skinId: 2, skinLines: [] };

  assert.deepEqual(
    getPrestigeChromaCardGroups([item, missingSkinline], {
      groupBy: "skinline",
      sortBy: "rank",
      order: "desc",
    }).map((group) => ({
      label: group.label,
      ids: group.items.map((entry) => entry.skinId),
    })),
    [
      { label: "Line10", ids: [1] },
      { label: "Line30", ids: [1] },
      { label: "\u672a\u5f52\u5c5e\u5957\u88c5", ids: [2] },
    ],
  );
  assert.deepEqual(
    getPrestigeChromaCardGroups([item, missingSkinline], {
      groupBy: "champion",
      sortBy: "rank",
      order: "desc",
    }).map((group) => ({
      label: group.label,
      ids: group.items.map((entry) => entry.skinId),
    })),
    [
      { label: validItem.heroName, ids: [2] },
      { label: "Ahri", ids: [1] },
    ],
  );
});

test("adds list page links to real prestige chroma groups", () => {
  const item = {
    ...validItem,
    skinId: 1,
    heroId: 103,
    heroName: "Ahri",
    skinLines: [{ id: 30, name: "Line30" }],
    universes: [{ id: 20, name: "U20" }],
  };
  const missingRelations = {
    ...validItem,
    skinId: 2,
    skinLines: [],
    universes: [],
  };

  assert.equal(
    getPrestigeChromaCardGroups([item], {
      groupBy: "champion",
      sortBy: "rank",
      order: "desc",
    })[0]?.href,
    "/champions/103-ahri",
  );
  assert.equal(
    getPrestigeChromaCardGroups([item], {
      groupBy: "universe",
      sortBy: "rank",
      order: "desc",
    })[0]?.href,
    "/universes/20-u20",
  );
  assert.equal(
    getPrestigeChromaCardGroups([item], {
      groupBy: "skinline",
      sortBy: "rank",
      order: "desc",
    })[0]?.href,
    "/skinlines/30-line30",
  );
  assert.equal(
    getPrestigeChromaCardGroups([missingRelations], {
      groupBy: "universe",
      sortBy: "rank",
      order: "desc",
    })[0]?.href,
    undefined,
  );
});

test("builds a reusable ImageObject schema", () => {
  assert.deepEqual(
    imageObjectSchema({
      name: "灵魂莲华 阿狸 臻彩原画",
      imageUrl: "https://example.com/prestige.jpg",
      pageUrl: "https://example.com/prestige-chromas/9001-灵魂莲华-阿狸-臻彩",
      description: "灵魂莲华 阿狸 臻彩资料",
    }),
    {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      name: "灵魂莲华 阿狸 臻彩原画",
      contentUrl: "https://example.com/prestige.jpg",
      url: "https://example.com/prestige-chromas/9001-灵魂莲华-阿狸-臻彩",
      description: "灵魂莲华 阿狸 臻彩资料",
    },
  );
});

test("keeps the existing skin ImageObject schema output", () => {
  assert.deepEqual(
    skinImageSchema(
      { name: "灵魂莲华 阿狸", description: "皮肤描述" },
      "https://example.com/skin.jpg",
      "https://example.com/skins/1-spirit-blossom-ahri",
    ),
    {
      "@context": "https://schema.org",
      "@type": "ImageObject",
      name: "灵魂莲华 阿狸 皮肤原画",
      contentUrl: "https://example.com/skin.jpg",
      url: "https://example.com/skins/1-spirit-blossom-ahri",
      description: "皮肤描述",
    },
  );
});

test("fetches and parses prestige chromas with the daily cache policy", async () => {
  const calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      status: 200,
      json: async () => ({ code: 0, data: [validItem] }),
    };
  };

  assert.deepEqual(
    await fetchPrestigeChromas(fetcher, "https://backend.example"),
    [validItem],
  );
  assert.deepEqual(calls, [
    {
      url: "https://backend.example/rest/lol/prestige-chromas",
      init: { next: { revalidate: 86400 } },
    },
  ]);
});

test("rejects prestige chroma network failures", async () => {
  const failure = new Error("connection reset");
  const fetcher = async () => {
    throw failure;
  };

  await assert.rejects(
    () => fetchPrestigeChromas(fetcher, "https://backend.example"),
    (error) =>
      error.message.includes("network request failed") &&
      error.cause === failure,
  );
});

test("rejects non-success prestige chroma HTTP responses", async () => {
  const fetcher = async () => ({
    ok: false,
    status: 503,
    json: async () => [],
  });

  await assert.rejects(
    () => fetchPrestigeChromas(fetcher, "https://backend.example"),
    /returned HTTP 503/,
  );
});

test("rejects invalid prestige chroma JSON responses", async () => {
  const failure = new SyntaxError("Unexpected token");
  const fetcher = async () => ({
    ok: true,
    status: 200,
    json: async () => {
      throw failure;
    },
  });

  await assert.rejects(
    () => fetchPrestigeChromas(fetcher, "https://backend.example"),
    (error) =>
      error.message.includes("returned invalid JSON") &&
      error.cause === failure,
  );
});

test("rejects prestige chroma business and contract failures from the fetch path", async () => {
  const responseFor = (payload) => async () => ({
    ok: true,
    status: 200,
    json: async () => payload,
  });

  await assert.rejects(
    () =>
      fetchPrestigeChromas(
        responseFor({ code: 500, data: [] }),
        "https://backend.example",
      ),
    /code 500/,
  );
  await assert.rejects(
    () =>
      fetchPrestigeChromas(
        responseFor([{ ...validItem, skinId: 0 }]),
        "https://backend.example",
      ),
    /skinId/,
  );
});

test("builds a prestige chroma path from skinId while preserving Unicode letters", () => {
  assert.equal(
    prestigeChromaPath({ skinId: 1234, itemName: "灵魂莲华 阿狸 臻彩" }),
    "/prestige-chromas/1234-灵魂莲华-阿狸-臻彩",
  );
});

test("compresses prestige chroma name punctuation into separators", () => {
  assert.equal(
    prestigeChromaPath({
      skinId: 1234,
      itemName: "  Étoile!!!灵魂、莲华?..  ",
    }),
    "/prestige-chromas/1234-étoile-灵魂-莲华",
  );
});

test("normalizes visually equivalent prestige chroma names to one path", () => {
  assert.equal(
    prestigeChromaPath({ skinId: 1234, itemName: "E\u0301toile" }),
    prestigeChromaPath({ skinId: 1234, itemName: "Étoile" }),
  );
});

test("uses unknown for an empty prestige chroma name", () => {
  assert.equal(
    prestigeChromaPath({ skinId: 1234, itemName: " !!! " }),
    "/prestige-chromas/1234-unknown",
  );
});

test("parses both a bare array and successful API wrappers", () => {
  assert.deepEqual(parsePrestigeChromaList([validItem]), [validItem]);
  assert.deepEqual(parsePrestigeChromaList({ code: 0, data: [validItem] }), [
    validItem,
  ]);
  assert.deepEqual(parsePrestigeChromaList({ code: 200, data: [validItem] }), [
    validItem,
  ]);
});

test("normalizes omitted relation arrays to empty arrays", () => {
  const [{ skinLines, universes }] = parsePrestigeChromaList([
    { heroId: 1, heroName: "阿狸", skinId: 9002, itemName: "臻彩", rank: 1 },
  ]);

  assert.deepEqual(skinLines, []);
  assert.deepEqual(universes, []);
});

test("returns only contract fields while preserving optional fields", () => {
  const [parsed] = parsePrestigeChromaList([
    {
      ...validItem,
      endTime: "2026-07-01",
      timgUrl: "https://example.com/category.png",
      unknownField: "must not escape the parser",
    },
  ]);

  assert.deepEqual(parsed, {
    ...validItem,
    endTime: "2026-07-01",
    timgUrl: "https://example.com/category.png",
  });
  assert.equal("unknownField" in parsed, false);
});

test("rejects failed wrappers, non-arrays, and invalid records", () => {
  assert.throws(
    () => parsePrestigeChromaList({ code: 500, data: [] }),
    /code 500/,
  );
  assert.throws(
    () => parsePrestigeChromaList({ code: 0, data: {} }),
    /data must be an array/,
  );
  assert.throws(
    () => parsePrestigeChromaList(null),
    /array or a successful API response/,
  );
  assert.throws(
    () => parsePrestigeChromaList([{ ...validItem, skinId: undefined }]),
    /skinId/,
  );
  assert.throws(
    () => parsePrestigeChromaList([{ ...validItem, skinId: 1.5 }]),
    /skinId/,
  );
  assert.throws(
    () => parsePrestigeChromaList([{ ...validItem, skinId: 0 }]),
    /skinId/,
  );
  assert.throws(
    () => parsePrestigeChromaList([{ ...validItem, skinId: 0 }]),
    /skinId/,
  );
  assert.throws(
    () => parsePrestigeChromaList([{ ...validItem, itemName: "  " }]),
    /itemName/,
  );
  assert.throws(
    () => parsePrestigeChromaList([{ ...validItem, skinLines: [{}] }]),
    /skinLines/,
  );
});

test("rejects instanceId characters that can change image URL semantics", () => {
  for (const instanceId of [
    "bad/path",
    "bad\\path",
    "bad?query",
    "bad#fragment",
  ]) {
    assert.throws(
      () => parsePrestigeChromaList([{ ...validItem, instanceId }]),
      /instanceId/,
    );
  }

  assert.equal(
    parsePrestigeChromaList([{ ...validItem, instanceId: "safe-ID_123" }])[0]
      .instanceId,
    "safe-ID_123",
  );
});

test("resolves one item by skinId, returns undefined when missing, and rejects duplicates", () => {
  assert.equal(resolvePrestigeChroma([validItem], 9001), validItem);
  assert.equal(resolvePrestigeChroma([validItem], 999), undefined);
  assert.throws(
    () => resolvePrestigeChroma([validItem, { ...validItem }], 9001),
    /Duplicate prestige chroma skinId 9001/,
  );
});

test("resolves a unique skinId and requests a redirect for a non-canonical slug", () => {
  assert.deepEqual(resolvePrestigeChromaRoute([validItem], "9001-wrong-slug"), {
    item: validItem,
    canonicalPath: "/prestige-chromas/9001-灵魂莲华-阿狸-臻彩",
    shouldRedirect: true,
  });
  assert.equal(
    resolvePrestigeChromaRoute([validItem], "999-missing"),
    undefined,
  );
});

test("accepts decoded and percent-encoded canonical segments but rejects invalid encoding", () => {
  const item = { ...validItem, itemName: "青花瓷 莫甘娜 天青" };
  const decoded = "9001-青花瓷-莫甘娜-天青";

  assert.equal(resolvePrestigeChromaRoute([item], decoded)?.item, item);
  assert.equal(
    resolvePrestigeChromaRoute([item], encodeURIComponent(decoded))?.item,
    item,
  );
  assert.equal(resolvePrestigeChromaRoute([item], "9001-%E0%A4%A"), undefined);
});

test("rejects duplicate skinIds while resolving a route", () => {
  assert.throws(
    () => resolvePrestigeChromaRoute([validItem, { ...validItem }], "9001-any"),
    /Duplicate prestige chroma skinId 9001/,
  );
});

test("rejects duplicate skinIds even when the full prestige chroma slug is unique", () => {
  const first = { ...validItem, skinId: 25073, itemName: "Blue Morgana" };
  const second = { ...validItem, skinId: 25073, itemName: "Gold Morgana" };

  assert.throws(
    () => resolvePrestigeChromaRoute([first, second], "25073-gold-morgana"),
    /Duplicate prestige chroma skinId 25073/,
  );
});

test("builds the prestige chroma metadata model from canonical item fields", () => {
  const description = buildPrestigeChromaDescription(validItem);
  const imageUrl = getPrestigeChromaImageUrl(validItem);

  assert.deepEqual(buildPrestigeChromaSeo(validItem, description, imageUrl), {
    title: "灵魂莲华 阿狸 臻彩臻彩原画与资料",
    description,
    canonicalPath: "/prestige-chromas/9001-灵魂莲华-阿狸-臻彩",
    imageUrl,
    imageAlt: "灵魂莲华 阿狸 臻彩臻彩原画",
  });
});

test("selects adjacent prestige chromas by rank and skinId identity", () => {
  const first = { ...validItem, skinId: 10, rank: 1, itemName: "第一款" };
  const current = { ...validItem, skinId: 20, rank: 2, itemName: "当前 A" };
  const next = { ...validItem, skinId: 30, rank: 3, itemName: "当前 B" };

  assert.deepEqual(
    getPrestigeChromaNavigation([next, first, current], { ...current }),
    {
      previousItem: first,
      nextItem: next,
    },
  );
  assert.deepEqual(getPrestigeChromaNavigation([next, first, current], first), {
    previousItem: undefined,
    nextItem: current,
  });
});

test("rejects adjacent prestige chroma navigation when skinIds are duplicated", () => {
  const first = {
    ...validItem,
    skinId: 25073,
    rank: 1,
    itemName: "Blue Morgana",
  };
  const current = {
    ...validItem,
    skinId: 25073,
    rank: 2,
    itemName: "Gold Morgana",
  };
  const next = {
    ...validItem,
    skinId: 25074,
    rank: 3,
    itemName: "Green Morgana",
  };

  assert.throws(
    () => getPrestigeChromaNavigation([next, first, current], current),
    /Duplicate prestige chroma skinId 25073/,
  );
});

test("sorts by rank then skinId without changing the input", () => {
  const items = [
    { ...validItem, skinId: 3, rank: 2 },
    { ...validItem, skinId: 2, rank: 1 },
    { ...validItem, skinId: 1, rank: 1 },
  ];
  const snapshot = structuredClone(items);

  assert.deepEqual(
    sortPrestigeChromas(items).map(({ skinId }) => skinId),
    [1, 2, 3],
  );
  assert.deepEqual(items, snapshot);
});

test("builds the image URL only for a non-empty instanceId", () => {
  assert.equal(
    getPrestigeChromaImageUrl(validItem),
    "https://game.gtimg.cn/images/lol/act/a20230715chromahub/skin/site3-abc123.jpg",
  );
  assert.equal(
    getPrestigeChromaImageUrl({ ...validItem, instanceId: "  " }),
    undefined,
  );
  assert.equal(
    getPrestigeChromaImageUrl({ ...validItem, instanceId: undefined }),
    undefined,
  );
});

test("builds a description from present fields without invented text", () => {
  assert.equal(
    buildPrestigeChromaDescription(validItem),
    "灵魂莲华 阿狸 臻彩 · 阿狸 · 臻彩 · 系列：灵魂莲华 · 宇宙：符文之地 · 2026-06-22",
  );
  assert.equal(
    buildPrestigeChromaDescription({
      ...validItem,
      heroName: "",
      cname: undefined,
      skinLines: [],
      universes: [],
      startDate: undefined,
      startTime: undefined,
    }),
    "灵魂莲华 阿狸 臻彩",
  );
});
