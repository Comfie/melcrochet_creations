/**
 * Lockout recovery: sets a new password for an admin account (and makes
 * sure it's active), signing out its existing sessions. Run against the
 * production DATABASE_URL from a trusted machine:
 *
 *   npm run admin:reset-password -- <username> <new-password>
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

async function main() {
  const [rawUsername, password] = process.argv.slice(2);
  if (!rawUsername || !password) {
    console.error("Usage: npm run admin:reset-password -- <username> <new-password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("The new password must be at least 8 characters.");
    process.exit(1);
  }
  const username = rawUsername.trim().toLowerCase();
  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user) {
    const known = await prisma.adminUser.findMany({ select: { username: true } });
    console.error(`No admin called "${username}". Known usernames: ${known.map((u) => u.username).join(", ") || "(none)"}`);
    process.exit(1);
  }
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(password, 10), isActive: true, tokenVersion: { increment: 1 } },
  });
  console.log(`Password reset for ${user.name} (@${user.username}). They can sign in with it now.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
