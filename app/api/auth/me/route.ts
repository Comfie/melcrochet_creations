import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { signSessionToken, setSessionCookie, SESSION_RENEW_AFTER_SECONDS } from "@/lib/session";
import { jsonError } from "@/lib/api-response";

/**
 * Called by the admin shell on every page. Besides reporting who is signed
 * in, it slides the session: once the token is a day old a fresh 30-day
 * token is issued, so regular use never hits the expiry.
 */
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return jsonError("Unauthorized", 401);
  }
  const { user, claims } = session;
  const res = NextResponse.json({
    authenticated: true,
    user: { id: user.id, username: user.username, name: user.name, email: user.email, role: user.role },
  });

  const ageSeconds = Math.floor(Date.now() / 1000) - claims.iat;
  if (ageSeconds > SESSION_RENEW_AFTER_SECONDS) {
    setSessionCookie(res, await signSessionToken(user.id, user.tokenVersion));
  }
  return res;
}
