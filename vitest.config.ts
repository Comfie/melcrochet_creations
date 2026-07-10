import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    // Tests run against a single shared, real Railway Postgres DB (no local
    // Docker DB, no per-file isolation). Running test files in parallel
    // workers causes cross-file races on shared fixture data (e.g. a
    // products test temporarily creating rows in the "Hats" category while
    // lib/queries.test.ts asserts an exact count for that same category).
    // Sequential file execution avoids that class of flakiness.
    fileParallelism: false,
  },
});
