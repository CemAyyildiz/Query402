import fs from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { getAnalyticsDb } from "./store.js";
import {
  createTempAnalyticsDbPath,
  resetAnalyticsStore
} from "../../../test/storage-test-helpers.js";

const describeUnlessWindows = process.platform === "win32" ? describe.skip : describe;

describeUnlessWindows("sqlite database file permissions", () => {
  let dbPath: string | undefined;

  afterEach(async () => {
    await resetAnalyticsStore(dbPath);
    dbPath = undefined;
  });

  it("creates a new database file with owner-only (0600) permissions", () => {
    dbPath = createTempAnalyticsDbPath();
    getAnalyticsDb(dbPath);

    const mode = fs.statSync(dbPath).mode & 0o777;
    expect(mode).toBe(0o600);
  });

  it("does not change the mode of a pre-existing database file", () => {
    dbPath = createTempAnalyticsDbPath();
    fs.writeFileSync(dbPath, "");
    fs.chmodSync(dbPath, 0o644);

    getAnalyticsDb(dbPath);

    const mode = fs.statSync(dbPath).mode & 0o777;
    expect(mode).toBe(0o644);
  });
});
