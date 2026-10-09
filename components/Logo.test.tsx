import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import Logo, { logoSrc, type LogoVariant } from "./Logo";

const VARIANTS: LogoVariant[] = ["horizontal", "stacked", "wordmark", "icon", "badge"];

describe("Logo", () => {
  it("points every variant and ground at a real file in public/brand", () => {
    for (const variant of VARIANTS) {
      for (const on of ["light", "dark"] as const) {
        const file = path.join(process.cwd(), "public", logoSrc(variant, on));
        expect(existsSync(file), file).toBe(true);
      }
    }
  });

  it("renders the reversed artwork on dark grounds", () => {
    const html = renderToStaticMarkup(<Logo variant="stacked" on="dark" />);
    expect(html).toContain("/brand/melcrochet-logo-primary-stacked-reversed.svg");
    expect(html).toContain('alt="MelCrochet Gifted Hands"');
  });

  it("renders an empty alt when decorative", () => {
    const html = renderToStaticMarkup(<Logo decorative />);
    expect(html).toContain('alt=""');
  });
});
