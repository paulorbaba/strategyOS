import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.js <your-password>");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log("\nCopy this value to ADMIN_PASSWORD_HASH in Railway:\n");
console.log(hash);
console.log();
