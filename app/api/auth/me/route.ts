import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { jsonError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    return jsonError("Unauthorized", 401);
  }
  return NextResponse.json({ authenticated: true, username: session.sub });
}
