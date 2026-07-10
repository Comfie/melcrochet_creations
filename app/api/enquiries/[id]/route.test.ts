import "dotenv/config";
import { describe, it, expect, beforeEach, afterEach, beforeAll } from "vitest";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { signSessionToken } from "@/lib/auth";

beforeAll(() => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-vitest-only";
});

async function authCookie() {
  const token = await signSessionToken("melissa");
  return `mc_admin=${token}`;
}

let enquiryId: string;

beforeEach(async () => {
  const enquiry = await prisma.enquiry.create({
    data: { name: "Vitest Tmp Enquirer", message: "temp message" },
  });
  enquiryId = enquiry.id;
});

afterEach(async () => {
  await prisma.enquiry.deleteMany({ where: { id: enquiryId } });
});

describe("PATCH /api/enquiries/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    const { PATCH } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/enquiries/${enquiryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "READ" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: enquiryId }) });
    expect(res.status).toBe(401);
  });

  it("updates the status when authenticated", async () => {
    const { PATCH } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/enquiries/${enquiryId}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ status: "READ" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: enquiryId }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("READ");
  });

  it("rejects an invalid status value", async () => {
    const { PATCH } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/enquiries/${enquiryId}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ status: "NOT_A_REAL_STATUS" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: enquiryId }) });
    expect(res.status).toBe(400);
  });
});
