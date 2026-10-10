import { describe, it, expect } from "vitest";
import { generateTempPassword, loginDetailsMessage } from "./temp-password";

describe("generateTempPassword", () => {
  it("makes three dash-separated groups without look-alike characters", () => {
    const pw = generateTempPassword();
    expect(pw).toMatch(/^[a-zA-Z2-9]{4}-[a-zA-Z2-9]{4}-[a-zA-Z2-9]{4}$/);
    expect(pw).not.toMatch(/[01oOlI]/);
    expect(pw.length).toBeGreaterThanOrEqual(8);
  });

  it("is random", () => {
    expect(generateTempPassword()).not.toBe(generateTempPassword());
  });
});

describe("loginDetailsMessage", () => {
  it("includes the link, username and password", () => {
    const msg = loginDetailsMessage({
      name: "Thandi Mokoena",
      username: "thandi",
      password: "abcd-efgh-jkmn",
      loginUrl: "https://melcrochet.co.za/admin/login",
    });
    expect(msg).toContain("Hi Thandi!");
    expect(msg).toContain("https://melcrochet.co.za/admin/login");
    expect(msg).toContain("Username: thandi");
    expect(msg).toContain("Temporary password: abcd-efgh-jkmn");
  });
});
