import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run hash-password -- <plain-text-password>");
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log("\nPaste this into ADMIN_PASSWORD_HASH in your .env:\n");
  console.log(hash);
  console.log();
});
