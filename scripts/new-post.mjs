#!/usr/bin/env node
import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline";
import process from "node:process";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const QUESTIONS = [
  "Title: ",
  "Slug (kebab-case): ",
  "Category (optional): ",
  "Tags, comma separated (optional): ",
];

/**
 * Reads the answers. Piped stdin needs an async iterator — sequential
 * `rl.question()` calls drop buffered input and hang, which breaks scripted
 * usage and CI.
 */
async function askAll() {
  if (process.stdin.isTTY) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    const answers = [];
    for (const question of QUESTIONS) {
      answers.push(
        await new Promise((resolve) => rl.question(question, resolve)),
      );
    }
    rl.close();
    return answers.map((answer) => answer.trim());
  }

  const rl = createInterface({ input: process.stdin, terminal: false });
  const answers = [];
  for await (const line of rl) {
    answers.push(line.trim());
    if (answers.length === QUESTIONS.length) break;
  }
  rl.close();
  return answers;
}

const [title = "", slug = "", category = "", tags = ""] = await askAll();

if (!title) {
  console.error("A title is required.");
  process.exit(1);
}
if (!SLUG.test(slug)) {
  console.error(
    "Slug must be kebab-case: lowercase letters, digits, single hyphens.",
  );
  process.exit(1);
}

const directory = join(process.cwd(), "content", "posts");
await mkdir(directory, { recursive: true });
const filePath = join(directory, `${slug}.mdx`);

try {
  await access(filePath);
  console.error(`Already exists: ${filePath}`);
  process.exit(1);
} catch {
  // expected — the file should not exist yet
}

const today = new Date().toISOString().slice(0, 10);
const tagList = tags
  ? tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  : [];

const lines = [
  "---",
  `title: ${JSON.stringify(title)}`,
  'description: ""',
  `published: ${today}`,
  category ? `category: ${JSON.stringify(category)}` : null,
  tagList.length > 0
    ? `tags: [${tagList.map((tag) => JSON.stringify(tag)).join(", ")}]`
    : null,
  "---",
  "",
  "Write the first paragraph here.",
  "",
].filter((line) => line !== null);

await writeFile(filePath, lines.join("\n"), "utf8");
console.log(`Created ${filePath}`);
