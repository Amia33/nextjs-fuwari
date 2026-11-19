#!/usr/bin/env node
import { createInterface } from "node:readline";
import process from "node:process";
import { Algorithm, hash, verify } from "@node-rs/argon2";

/** OWASP minimum for Argon2id: m=19456 KiB (19 MiB), t=2, p=1. */
const OWASP = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

const isTty = process.stdin.isTTY === true;

/**
 * Reads the passphrase without echoing it.
 *
 * On a TTY we mute readline's output echo. When stdin is piped (CI, tests) we
 * consume lines from an async iterator instead — sequential `rl.question()`
 * calls on a piped stream drop buffered input and hang.
 */
async function readSecret(question) {
  if (!isTty) {
    const rl = createInterface({ input: process.stdin, terminal: false });
    const iterator = rl[Symbol.asyncIterator]();
    const values = [];
    for (let i = 0; i < 2; i++) {
      const { value, done } = await iterator.next();
      if (done) break;
      values.push(String(value).trim());
    }
    rl.close();
    return values;
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  let muted = false;
  rl._writeToOutput = (text) => {
    if (!muted) {
      rl.output.write(text);
      return;
    }
    if (text.includes("\n") || text.includes("\r")) process.stdout.write("\n");
  };

  const answer = await new Promise((resolve) => {
    rl.question(question, (value) => {
      muted = true;
      resolve(value.trim());
    });
  });

  rl.close();
  return [answer];
}

const args = process.argv.slice(2);
const checkIndex = args.indexOf("--check");

if (checkIndex !== -1) {
  const phc = args[checkIndex + 1];
  if (!phc) {
    console.error("Usage: pnpm hash-password --check '<argon2id-phc-string>'");
    process.exit(1);
  }
  const [password] = await readSecret("Password: ");

  let ok = false;
  try {
    ok = await verify(phc, password ?? "");
  } catch {
    console.error("That does not look like a valid Argon2 PHC string.");
    process.exit(1);
  }
  console.log(ok ? "✓ matches" : "✗ does not match");
  process.exit(ok ? 0 : 1);
}

const [password, confirmation] = await readSecret("Password: ");

if (!password) {
  console.error("Password must not be empty.");
  process.exit(1);
}
if (isTty && password !== confirmation) {
  console.error("Passwords do not match.");
  process.exit(1);
}

const passwordHash = await hash(password, OWASP);

console.log("\nAdd this to the frontmatter of the post, moment, or album:\n");
console.log("passwordProtected: true");
console.log(`passwordHash: "${passwordHash}"`);
console.log(
  "\nKeep the plaintext password in your password manager — it is stored nowhere in this repo.",
);
