import "dotenv/config";
import { describe, it, expect, afterEach, beforeAll } from "vitest";
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

const createdIds: string[] = [];

afterEach(async () => {
  while (createdIds.length) {
    const id = createdIds.pop()!;
    await prisma.enquiry.delete({ where: { id } }).catch(() => {});
  }
});

function makeEnquiryRequest(body: unknown, ip = "203.0.113.9") {
  return new NextRequest("http://localhost:3000/api/enquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

describe("POST /api/enquiries", () => {
  it("creates an enquiry with valid input", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeEnquiryRequest({
        name: "Vitest Tmp Enquirer",
        email: "tmp@example.com",
        message: "Do you make custom colours?",
      })
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.status).toBe("NEW");
    createdIds.push(body.id);
  });

  it("rejects when the honeypot field is filled", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeEnquiryRequest({
        name: "Bot",
        message: "spam",
        website: "http://spam.example",
      })
    );
    expect(res.status).toBe(400);
  });

  it("rate-limits after repeated requests from the same IP", async () => {
    const { POST } = await import("./route");
    const ip = `203.0.113.${Math.floor(Math.random() * 200) + 10}`;
    let lastStatus = 0;
    for (let i = 0; i < 7; i++) {
      const res = await POST(
        makeEnquiryRequest({ name: "Vitest Tmp", message: `attempt ${i}` }, ip)
      );
      lastStatus = res.status;
      if (res.status === 201) {
        const body = await res.json();
        createdIds.push(body.id);
      }
    }
    expect(lastStatus).toBe(429);
  });
});

describe("GET /api/enquiries", () => {
  it("returns 401 when not authenticated", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/enquiries");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns an array when authenticated", async () => {
    const { GET } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/enquiries", {
      headers: { Cookie: await authCookie() },
    });
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});
