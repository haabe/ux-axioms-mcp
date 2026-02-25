import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import type { Axiom } from "./types.js";

// Resolve rules directory robustly in various launch contexts:
// Priority:
// 1) RULES_DIR env var (absolute or relative)
// 2) ../../database/rules (when running from dist/src)
// 3) ../database/rules (when running from src)
// 4) CWD/database/rules (fallback)
function resolveRulesDir(): string {
  const fromEnv = process.env.RULES_DIR;
  if (fromEnv && fromEnv.trim().length > 0) {
    return path.resolve(fromEnv);
  }

  const here = fileURLToPath(new URL(".", import.meta.url));
  const candidates = [
    path.resolve(here, "..", "..", "database", "rules"),     // dist/src -> project/database/rules
    path.resolve(here, "..", "..", "..", "database", "rules"), // dist -> project/database/rules
    path.resolve(here, "..", "database", "rules"),             // src -> project/database/rules
    path.resolve(process.cwd(), "database", "rules"),           // fallback to CWD
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
        return p;
      }
    } catch {
      // ignore and try next
    }
  }

  // If none matched, return the first candidate for error context
  return candidates[0];
}

const RULES_DIR = resolveRulesDir();

export function loadAxioms(): Axiom[] {
  if (!fs.existsSync(RULES_DIR)) {
    console.warn(`Warning: Rules directory not found at ${RULES_DIR}`);
    return [];
  }

  const files = fs.readdirSync(RULES_DIR).filter((f) => f.endsWith(".md"));

  console.log(`Axioms: using rules dir: ${RULES_DIR} with ${files.length} file(s)`);

  return files.map((file) => {
		const filePath = path.join(RULES_DIR, file);
		const fileContent = fs.readFileSync(filePath, "utf-8");
		const { data, content } = matter(fileContent);

		return {
			id: data.id || path.basename(file, ".md"),
			title: data.title || "Untitled",
			category: data.category || "uncategorized",
			tags: data.tags || [],
			evidence_level: data.evidence_level || "unknown",
			validated: data.validated || false,
			last_updated: data.last_updated || new Date().toISOString(),
			related_rules: data.related_rules || [],
			content: content.trim(),
		} as Axiom;
	});
}
