// Runs the unit tests in tests/.
// The lib/ sources are TypeScript with extensionless imports, so they are
// compiled to CommonJS in a throwaway .test-build/ folder with the project's
// own tsc, tested with node --test, then cleaned up. No extra test dependency.
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

const root = new URL("..", import.meta.url).pathname;
try {
  execSync(
    "npx tsc lib/compatibility.ts lib/bundle.ts lib/rentSplit.ts lib/verification.ts lib/store.ts lib/seed.ts lib/auth.ts lib/payments.ts lib/moderation.ts lib/escrow.ts lib/realtime.ts lib/types.ts lib/validate.ts lib/rateLimit.ts lib/logger.ts lib/health.ts lib/apiError.ts lib/paymentVerify.ts " +
      "--outDir .test-build --module commonjs --target es2022 --esModuleInterop --skipLibCheck --moduleResolution node",
    { cwd: root, stdio: "inherit" },
  );
  execSync("node --test tests/unit.test.cjs", { cwd: root, stdio: "inherit" });
} finally {
  rmSync(`${root}.test-build`, { recursive: true, force: true });
}
