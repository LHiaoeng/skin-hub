import assert from "node:assert/strict";
import test from "node:test";

import { parseSkinlineSort, sortSkinlines } from "../src/lib/lol/skinline-sort.ts";

const skinlines = [
  { riotSkinlineId: 3, name: "乙", skinCount: 2 },
  { riotSkinlineId: 2, name: "甲", skinCount: 2 },
  { riotSkinlineId: 1, name: "甲", skinCount: 5 },
];

test("defaults to name ascending with stable id tie-break", () => {
  assert.deepEqual(
    sortSkinlines(skinlines, parseSkinlineSort()).map((item) => item.riotSkinlineId),
    [1, 2, 3],
  );
});

test("supports name descending", () => {
  assert.deepEqual(
    sortSkinlines(skinlines, { key: "name", order: "desc" }).map((item) => item.riotSkinlineId),
    [3, 1, 2],
  );
});

test("count sorting uses name and id as stable secondary keys", () => {
  assert.deepEqual(
    sortSkinlines(skinlines, { key: "count", order: "asc" }).map((item) => item.riotSkinlineId),
    [2, 3, 1],
  );
  assert.deepEqual(
    sortSkinlines(skinlines, { key: "count", order: "desc" }).map((item) => item.riotSkinlineId),
    [1, 2, 3],
  );
});
