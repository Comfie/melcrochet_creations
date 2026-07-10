import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";

describe("POST /api/auth/logout", () => {
  it("clears the session cookie", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const cookie = res.cookies.get("mc_admin");
    // Deleted cookies are represented with an empty value and immediate expiry.
    expect(cookie?.value ?? "").toBe("");
  });
});
