import assert from "node:assert/strict";
import test from "node:test";

import { skinlineDetailPath } from "../src/lib/api/skinline-contract.ts";

test("versions the skinline detail request when its response contract changes", () => {
  assert.equal(skinlineDetailPath(189), "/rest/lol/skinlines/189?contractVersion=2");
});
