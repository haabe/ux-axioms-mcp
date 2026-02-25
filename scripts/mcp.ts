#!/usr/bin/env node
// npx ux-axioms-mcp@latest mcp -t stdio
// or: npx ux-axioms-mcp@latest --stdio

const argv = process.argv.slice(2);
const wantsStdio =
  argv.includes("--stdio") ||
  (argv[0] === "mcp" && (argv[1] === "-t" || argv[1] === "--transport") && argv[2] === "stdio");

if (wantsStdio) {
  if (!process.argv.includes("--stdio")) process.argv.push("--stdio");
  // Run server in this process so stdio is wired directly
  await import("../src/index.js");
} else {
  console.error();
  process.exit(2);
}

