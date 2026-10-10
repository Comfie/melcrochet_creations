import type { NextRequest, NextResponse } from "next/server";
import type { AdminUser } from "@prisma/client";
import prisma from "@/lib/prisma";
import { jsonError } from "@/lib/api-response";
import { SESSION_COOKIE_NAME, verifySessionToken, type SessionClaims } from "@/lib/session";

export {
  signSessionToken,
  verifySessionToken,
  setSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/session";

/** The fields of an admin that are safe to send to the browser. */
export const PUBLIC_USER_SELECT = {
  id: true,
  username: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
} as const;

export interface Session {
  user: AdminUser;
  claims: SessionClaims;
}

/**
 * The signed-in admin, or null. Beyond a valid JWT the account must still
 * exist, be active, and have the same tokenVersion as when the token was
 * issued — so deactivating someone or changing a password signs them out.
 */
export async function getSession(request: NextRequest): Promise<Session | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const claims = token ? await verifySessionToken(token) : null;
  if (!claims) return null;
  const user = await prisma.adminUser.findUnique({ where: { id: claims.sub } });
  if (!user || !user.isActive || user.tokenVersion !== claims.v) return null;
  return { user, claims };
}

/** Route guard: null when signed in, otherwise a 401 response to return. */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const session = await getSession(request);
  return session ? null : jsonError("Unauthorized", 401);
}

/** Route guard for team management: owners only. */
export async function requireOwner(
  request: NextRequest
): Promise<{ session: Session; response?: never } | { session?: never; response: NextResponse }> {
  const session = await getSession(request);
  if (!session) return { response: jsonError("Unauthorized", 401) };
  if (session.user.role !== "OWNER") {
    return { response: jsonError("Only the owner can manage the team", 403) };
  }
  return { session };
}
