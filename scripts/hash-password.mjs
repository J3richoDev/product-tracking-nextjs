import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "your-password"');
  process.exit(1);
}
// Base64-encoded so the bcrypt "$" chars don't get expanded by .env loaders.
console.log(Buffer.from(bcrypt.hashSync(password, 12)).toString("base64"));
