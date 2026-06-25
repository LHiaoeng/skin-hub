# 臻彩 ID 修正规则

## 背景

`GET /rest/lol/prestige-chromas` 的源头数据可能出现 `skinId` 重复但 `itemName` 不同的情况。例如：

| 错误源头 skinId | itemName           | 正确臻彩 ID |
| --------------- | ------------------ | ----------- |
| 25073           | 青花瓷 莫甘娜 天青 | 25073       |
| 25073           | 青花瓷 莫甘娜 釉色 | 25074       |

这种场景不能由前端猜测，也不能通过 ID 数学规律推断。后端需要回查 Riot 客户端 game-data 中的英雄详情 JSON，以 `skins[*].chromas[*].id` 作为臻彩 ID 的权威事实源。

## 权威数据源

按英雄 ID 请求：

```text
/latest/plugins/rcp-be-lol-game-data/global/zh_cn/v1/champions/{heroId}.json
```

例如莫甘娜：

```text
/latest/plugins/rcp-be-lol-game-data/global/zh_cn/v1/champions/25.json
```

后端应读取响应中的：

```text
skins[*].chromas[*]
```

其中 `chromas[*].id` 是最终用于覆盖错误 `skinId` 的正确臻彩 ID。

## 触发条件

后端生成 `/rest/lol/prestige-chromas` 响应前，按 `skinId` 分组检查：

- 同一 `skinId` 只有一条记录：正常返回。
- 同一 `skinId` 有多条记录且 `itemName` 完全一致：视为重复数据，按现有去重或报错策略处理。
- 同一 `skinId` 有多条记录且 `itemName` 不同：触发臻彩 ID 修正流程。

## 匹配优先级

对需要修正的记录，使用记录上的 `heroId` 请求 champion JSON，然后展开所有皮肤的 `chromas`：

```ts
const chromas = champion.skins.flatMap((skin) =>
  (skin.chromas ?? []).map((chroma) => ({
    baseSkinId: skin.id,
    baseSkinName: skin.name,
    ...chroma,
  })),
);
```

匹配优先级：

1. `instanceId` 精确匹配。
2. 炫彩名称精确匹配。
3. `itemName` 包含炫彩名称。

匹配前需要统一做名称归一化：

- `trim()`
- 全角/半角和 Unicode 规范化使用同一套工具函数。
- 移除连续空白差异。

## 成功与失败处理

找到唯一匹配时：

```ts
item.skinId = matchedChroma.id;
```

找不到或匹配到多条时，不能静默猜测，必须显式暴露数据异常：

```text
无法修正臻彩 ID: heroId={heroId}, skinId={skinId}, itemName={itemName}
```

建议同时记录：

- 原始错误 `skinId`
- `itemName`
- `instanceId`
- 请求的 champion JSON URL
- 候选 chroma 列表数量

## 示例

输入异常：

```json
[
  {
    "heroId": 25,
    "skinId": 25073,
    "itemName": "青花瓷 莫甘娜 天青",
    "instanceId": "..."
  },
  {
    "heroId": 25,
    "skinId": 25073,
    "itemName": "青花瓷 莫甘娜 釉色",
    "instanceId": "..."
  }
]
```

修正后：

```json
[
  {
    "heroId": 25,
    "skinId": 25073,
    "itemName": "青花瓷 莫甘娜 天青"
  },
  {
    "heroId": 25,
    "skinId": 25074,
    "itemName": "青花瓷 莫甘娜 釉色"
  }
]
```

## 后端测试要求

至少覆盖：

- `skinId` 重复且 `itemName` 不同时，通过 `instanceId` 修正为 `chromas[*].id`。
- 缺少 `instanceId` 时，通过名称修正为 `chromas[*].id`。
- 找不到匹配 chroma 时抛出明确异常。
- 匹配多个 chroma 时抛出明确异常。
- 修正后 `/rest/lol/prestige-chromas` 不再返回同 ID 不同名的记录。
