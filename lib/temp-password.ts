// No look-alikes (0/O, 1/l/I) — these get read off a phone and retyped.
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** A random temporary password for a new or reset team member, e.g. "kT7m-Qw4z-Hp9r". */
export function generateTempPassword(groups = 3, groupSize = 4): string {
  const bytes = new Uint8Array(groups * groupSize);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  const parts: string[] = [];
  for (let i = 0; i < groups; i++) parts.push(chars.slice(i * groupSize, (i + 1) * groupSize).join(""));
  return parts.join("-");
}

/** Message to send a new team member their sign-in details. */
export function loginDetailsMessage(opts: { name: string; username: string; password: string; loginUrl: string }): string {
  const first = opts.name.trim().split(/\s+/)[0] || opts.name;
  return [
    `Hi ${first}! You can now help manage the MelCrochet Gifted Hands website.`,
    `Sign in: ${opts.loginUrl}`,
    `Username: ${opts.username}`,
    `Temporary password: ${opts.password}`,
    "Please change your password under My profile after signing in.",
  ].join("\n");
}
