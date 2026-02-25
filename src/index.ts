import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { loadAxioms } from "./loader.js";

// --- 1. Server Setup ---

const server = new McpServer({
	name: "ux-axioms-mcp",
	version: "1.0.0",
});

// Load data from markdown files
const axioms = loadAxioms();
const axiomById = new Map(axioms.map((a) => [a.id, a] as const));
const tagIndex = new Map<string, string[]>();
for (const a of axioms) {
  for (const raw of a.tags || []) {
    const tag = String(raw).toLowerCase().trim();
    const arr = tagIndex.get(tag) ?? [];
    arr.push(a.id);
    tagIndex.set(tag, arr);
  }
}

function getIdsForTags(tags: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of tags) {
    const t = raw.toLowerCase().trim();
    const ids = tagIndex.get(t);
    if (ids) {
      for (const id of ids) {
        if (!seen.has(id)) { seen.add(id); out.push(id); }
      }
    }
  }
  return out;
}

function expandRelated(ids: Iterable<string>, steps = 1): string[] {
  const seen = new Set<string>(ids);
  let frontier = Array.from(seen);
  for (let s = 0; s < steps; s++) {
    const next: string[] = [];
    for (const id of frontier) {
      const rel = axiomById.get(id)?.related_rules;
      if (!rel) continue;
      for (const rid of rel) {
        if (!seen.has(rid)) { seen.add(rid); next.push(rid); }
      }
    }
    frontier = next;
  }
  return Array.from(seen);
}

// --- 2. Resource Implementation ---

// Resource: axioms://list — Returns the full list of axioms
server.registerResource(
	"axioms",
	"axioms://list",
	{ mimeType: "application/json" },
	async (uri) => ({
		contents: [
			{
				uri: uri.href,
				text: JSON.stringify(axioms, null, 2),
				mimeType: "application/json",
			},
		],
	}),
);

// Resource: axioms://search/{keyword} — Query by keyword
server.registerResource(
    "search",
    new ResourceTemplate("axioms://search/{keyword}", { list: undefined }),
    { mimeType: "application/json" },
    async (uri, variables) => {
		const term = String(
			(variables as Record<string, string> | undefined)?.keyword ?? "",
		).toLowerCase();
		const filtered = axioms.filter(
			(a) =>
				a.title.toLowerCase().includes(term) ||
				a.content.toLowerCase().includes(term) ||
				a.tags.some((t) => t.toLowerCase().includes(term)),
		);
		return {
			contents: [
				{
					uri: uri.href,
					text: JSON.stringify(filtered, null, 2),
					mimeType: "application/json",
				},
			],
		};
    },
);

// --- 3. Tools Implementation ---

type RankItem<T> = { item: T; score: number; why: string[] };

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replaceAll(/[^a-z0-9_\-\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function rankAxiomsByTerms(terms: string[]): RankItem<typeof axioms[number]>[] {
  const tset = new Set(terms.map((t) => t.toLowerCase()));
  const results: RankItem<typeof axioms[number]>[] = [];
  for (const a of axioms) {
    let score = 0;
    const why: string[] = [];
    const haystack = `${a.title}\n${a.content}\n${(a.tags || []).join(" ")}`.toLowerCase();
    for (const t of tset) {
      if (haystack.includes(t)) {
        score += 1;
        why.push(`matched '${t}'`);
      }
    }
    if (score > 0) {
      results.push({ item: a, score, why });
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results;
}

function readJson<T>(p: string, fallback: T): T {
  try {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf-8");
      return JSON.parse(raw) as T;
    }
  } catch {
    // ignore
  }
  return fallback;
}

const mappingsDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "database", "mappings");
const personaMap = readJson<Record<string, string[]>>(path.join(mappingsDir, "personas.json"), {});
const componentMap = readJson<Record<string, string[]>>(path.join(mappingsDir, "components.json"), {});
const taskMap = readJson<Record<string, string[]>>(path.join(mappingsDir, "tasks.json"), {});

function normalizeSeeds(values: string[]): { ids: string[]; tags: string[] } {
  const ids: string[] = [];
  const tags: string[] = [];
  for (const v of values) {
    if (axiomById.has(v)) ids.push(v);
    else tags.push(v);
  }
  return { ids, tags };
}

function byIds(ids: string[]) {
  const set = new Set(ids);
  return axioms.filter((a) => set.has(a.id));
}

// Tool: list_axioms (keyword filters title/content/tags)
server.registerTool(
  "list_axioms",
  {
    title: "List UX axioms",
    description: "List all axioms or filter by a keyword.",
    inputSchema: z.object({ keyword: z.string().optional(), limit: z.number().int().min(1).max(200).optional() }),
  },
  async (args) => {
    const { keyword, limit } = (args ?? {}) as { keyword?: string; limit?: number };
    const results = keyword ? rankAxiomsByTerms(tokenize(keyword)).map((r) => r.item) : axioms;
    const sliced = typeof limit === "number" ? results.slice(0, limit) : results;
    return { content: [{ type: "text", text: JSON.stringify(sliced, null, 2) }] };
  },
);

// Tool: get_axiom
server.registerTool(
  "get_axiom",
  { title: "Get axiom by id", description: "Return a single axiom by id.", inputSchema: z.object({ id: z.string().min(1) }) },
  async (args) => {
    const { id } = args as { id: string };
    const found = axioms.find((a) => a.id === id);
    if (!found) throw new Error(`Axiom not found: ${id}`);
    return { content: [{ type: "text", text: JSON.stringify(found, null, 2) }] };
  },
);

// Tool: suggest_axioms (uses tags/related_rules; falls back to term ranking)
server.registerTool(
  "suggest_axioms",
  {
    title: "Suggest relevant axioms",
    description: "Suggest axioms based on task/component/persona/keywords.",
    inputSchema: z.object({ task: z.string().optional(), component: z.string().optional(), persona: z.string().optional(), keywords: z.array(z.string()).optional(), limit: z.number().int().min(1).max(50).optional() }),
  },
  async (args) => {
    const { task, component, persona, keywords, limit } = (args ?? {}) as { task?: string; component?: string; persona?: string; keywords?: string[]; limit?: number };
    const seedVals: string[] = [];
    if (persona && personaMap[persona.toLowerCase()]) seedVals.push(...personaMap[persona.toLowerCase()]);
    if (component && componentMap[component.toLowerCase()]) seedVals.push(...componentMap[component.toLowerCase()]);
    if (task) { const k = Object.keys(taskMap).find((t) => task.toLowerCase().includes(t)); if (k) seedVals.push(...(taskMap[k] || [])); }
    const { ids: seedIds, tags: seedTags } = normalizeSeeds(seedVals);
    const tagIds = getIdsForTags(seedTags);
    const expandedIds = expandRelated([...seedIds, ...tagIds], 1);
    const seedAxioms = expandedIds.map((id) => axiomById.get(id)).filter(Boolean) as typeof axioms;
    const termList = [task ?? "", component ?? "", ...(keywords ?? [])].filter(Boolean);
    const ranked = termList.length ? rankAxiomsByTerms(termList.flatMap(tokenize)) : [];
    const combined: RankItem<typeof axioms[number]>[] = [];
    const seen = new Set<string>();
    for (const a of seedAxioms) {
      if (!seen.has(a.id)) { combined.push({ item: a, score: 10, why: ["seed mapping"] }); seen.add(a.id); }
    }
    for (const r of ranked) {
      if (!seen.has(r.item.id)) { combined.push(r); seen.add(r.item.id); }
    }
    combined.sort((a, b) => b.score - a.score);
    const limited = typeof limit === "number" ? combined.slice(0, limit) : combined.slice(0, 20);
    const output = limited.map((r) => ({ id: r.item.id, title: r.item.title, score: r.score, why: r.why }));
    return { content: [{ type: "text", text: JSON.stringify(output, null, 2) }] };
  },
);

// Tool: recommend_for_task (mapping values may be tags or ids)
server.registerTool(
  "recommend_for_task",
  { title: "Recommend axioms for task", description: "Curated axioms for common tasks.", inputSchema: z.object({ task: z.string().min(1), persona: z.string().optional() }) },
  async (args) => {
    const { task, persona } = args as { task: string; persona?: string };
    const vals: string[] = [];
    const k = Object.keys(taskMap).find((t) => task.toLowerCase().includes(t));
    if (k) vals.push(...(taskMap[k] || []));
    if (persona && personaMap[persona.toLowerCase()]) vals.push(...personaMap[persona.toLowerCase()]);
    const { ids, tags } = normalizeSeeds(vals);
    const results = byIds([...ids, ...getIdsForTags(tags)]);
    return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
  },
);

// Tool: prioritize_axioms (persona maps to tags or ids)
server.registerTool(
  "prioritize_axioms",
  { title: "Prioritize axioms by persona", description: "Order axioms by persona focus.", inputSchema: z.object({ persona: z.string().min(1) }) },
  async (args) => {
    const { persona } = args as { persona: string };
    const vals = personaMap[persona.toLowerCase()] || [];
    const { ids, tags } = normalizeSeeds(vals);
    const results = byIds([...ids, ...getIdsForTags(tags)]);
    return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
  },
);

// Tool: analyze_ui — naive heuristics on provided HTML
server.registerTool(
  "analyze_ui",
  { title: "Analyze HTML for axiom violations", description: "Naive static checks for common issues.", inputSchema: z.object({ html: z.string().min(1), persona: z.string().optional() }) },
  async (args) => {
    const { html } = args as { html: string };
    const findings: Array<{ axiom: string; violation: string; location?: string; fix: string }> = [];
    // Fitts's Law: look for elements with inline small sizes
    // split the regex into separate width/height checks to reduce complexity
    const widthRegex = /<(button|a|input)([^>]*)style="[^"]*width\s*:\s*(\d+)px[^"]*"/gi;
    const heightRegex = /<(button|a|input)([^>]*)style="[^"]*height\s*:\s*(\d+)px[^"]*"/gi;
    for (const m of html.matchAll(widthRegex)) {
      const w = Number(m[3] || 0);
      if (w && w < 44) {
        findings.push({ axiom: "fitts_law", violation: "Clickable target width below 44px", location: m[0].slice(0,120), fix: "Increase minimum width to 44px." });
      }
    }
    for (const m of html.matchAll(heightRegex)) {
      const h = Number(m[3] || 0);
      if (h && h < 44) {
        findings.push({ axiom: "fitts_law", violation: "Clickable target height below 44px", location: m[0].slice(0,120), fix: "Increase minimum height to 44px." });
      }
    }
    // Hick's Law: naive — long nav/menu lists
    const liCount = (html.match(/<li[\s>]/gi) || []).length;
    if (liCount > 12) {
      findings.push({ axiom: "hicks_law", violation: `List may contain too many choices (${liCount})`, fix: "Group or chunk choices; add categorization or search." });
    }
    // Proximity/Labels: labels missing for inputs
    const inputs = [...(html.matchAll(/<input([^>]*)>/gi))].map((x) => x[1]);
    const hasLabelFor = /<label[^>]*for="([^"]+)"/gi;
    const labeledIds = new Set<string>();
    for (const lm of html.matchAll(hasLabelFor)) {
      labeledIds.add(lm[1]);
    }
    for (const attrs of inputs) {
      const idMatch = /id="([^"]+)"/.exec(attrs);
      const ariaLabel = /aria-label="([^"]+)"/.exec(attrs);
      if (!ariaLabel && (!idMatch || !labeledIds.has(idMatch[1]))) {
        findings.push({ axiom: "proximity", violation: "Input without an associated label", location: `<input${attrs}>`.slice(0, 120), fix: "Add a <label for> or aria-label/aria-labelledby." });
      }
    }
    // Readability: tiny font-size inline
    const smallFontCount = [...(html.matchAll(/font-size\s*:\s*(\d+)px/gi))]
      .map((x) => Number(x[1]))
      .filter((n) => n > 0 && n < 14)
      .length;
    if (smallFontCount > 0) findings.push({ axiom: "readability_vs_legibility", violation: "Inline font-size below 14px detected", fix: "Increase base text to 14–16px for desktop." });
    return { content: [{ type: "text", text: JSON.stringify(findings, null, 2) }] };
  },
);

// Tool: generate_spec — produce design constraints & acceptance criteria
server.registerTool(
  "generate_spec",
  { title: "Generate axiom-driven spec", description: "Create a spec section using relevant axioms.", inputSchema: z.object({ task: z.string().min(1), context: z.string().optional(), persona: z.string().optional() }) },
  async (args) => {
    const { task, context, persona } = args as { task: string; context?: string; persona?: string };
    // Reuse local function instead of self-calling tool to keep SDK-simple
    const ranked = rankAxiomsByTerms(tokenize(`${task} ${persona ?? ""}`));
    const suggested = ranked.slice(0, 5).map((r) => ({ id: r.item.id, title: r.item.title }));
    const parts = [
      `# Spec: ${task}`,
      context ? `\nContext:\n\n${context}\n` : undefined,
      `\nDesign Constraints (Axioms):`,
      ...suggested.map((s) => `- ${s.title} (id: ${s.id})`),
      `\nAcceptance Criteria:`,
      `- No targets below 44x44px where touch interaction is expected (Fitts's Law).`,
      `- Limit top-level choices or group them meaningfully (Hick's Law).`,
      `- Inputs have associated labels (Proximity/Readability).`,
      `\nOpen Questions:`,
      `- Which personas are primary? Any accessibility requirements?`,
    ];
    const textOut = parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join("\n");
    return { content: [{ type: "text", text: textOut }] };
  },
);

// Tool: generate_tests — scaffold tests for frameworks
server.registerTool(
  "generate_tests",
  { title: "Generate axiom tests", description: "Create starter tests for Playwright/Jest-axe.", inputSchema: z.object({ framework: z.enum(["playwright", "jest-axe", "vitest"]).default("playwright"), context: z.string().optional(), persona: z.string().optional() }) },
  async (args) => {
    const { framework } = args as { framework: "playwright" | "jest-axe" | "vitest" };
    let out = "";
    if (framework === "playwright") {
      out = `import { test, expect } from '@playwright/test';\n\n// Fitts's Law: ensure minimum hit area\ntest('targets meet minimum size', async ({ page }) => {\n  // TODO: adapt selector list\n  const handles = await page.$$('button, a, input[type=button], input[type=submit]');\n  for (const h of handles) {\n    const box = await h.boundingBox();\n    if (!box) continue;\n    expect(box.width).toBeGreaterThanOrEqual(44);\n    expect(box.height).toBeGreaterThanOrEqual(44);\n  }\n});\n`; }
    if (framework === "jest-axe") {
      out = `import { configureAxe } from 'jest-axe';\n// Example a11y test scaffold, integrate with your render pipeline\nconst axe = configureAxe();\n// TODO: render HTML and pass to axe\n// const results = await axe(html);\n// expect(results).toHaveNoViolations();\n`;
    }
    if (framework === "vitest") {
      out = `import { test, expect } from 'vitest';\n// Example placeholder for timing test (Doherty Threshold)\ntest('responds under 400ms', async () => {\n  const start = Date.now();\n  // TODO: call your function / simulate interaction\n  const elapsed = Date.now() - start;\n  expect(elapsed).toBeLessThan(400);\n});\n`;
    }
    return { content: [{ type: "text", text: out }] };
  },
);

// Tool: link_patterns — infer tags then map to axioms; no hardcoded axiom ids
server.registerTool(
  "link_patterns",
  { title: "Link patterns to axioms", description: "Suggest axioms based on code or HTML patterns.", inputSchema: z.object({ html: z.string().optional(), code: z.string().optional() }) },
  async (args) => {
    const { html, code } = (args ?? {}) as { html?: string; code?: string };
    const text = `${html ?? ""}\n${code ?? ""}`.toLowerCase();
    const inferredTags: string[] = [];
    if (/aria-label|aria-labelledby|role=/.test(text)) inferredTags.push("accessibility");
    if (/<nav\b|menu|dropdown|select\b/.test(text)) inferredTags.push("navigation");
    if (/<form\b|<input\b|label\b/.test(text)) inferredTags.push("forms");
    if (/loading|spinner|skeleton/.test(text)) inferredTags.push("loading");
    const ids = getIdsForTags(inferredTags);
    const expanded = expandRelated(ids, 1);
    return { content: [{ type: "text", text: JSON.stringify({ tags: inferredTags, axioms: expanded }, null, 2) }] };
  },
);

async function main() {
	const args = process.argv.slice(2);

	if (args.includes("--stdio")) {
		// STDIO Transport for CLI/Local Agents
		const transport = new StdioServerTransport();
		await server.connect(transport);
		console.error("UX Axioms MCP Server running on STDIO");
	} else {
		// HTTP + SSE Transport for Web/Remote Clients
		const app = express();
		const port = Number.parseInt(process.env.PORT || "3000", 10);

		app.use(cors());
		app.use(express.json());

		// Simple API-key auth: supports multiple keys via VALID_API_KEYS (comma-separated)
		const validKeys = (
			process.env.VALID_API_KEYS ||
			process.env.MCP_API_KEY ||
			""
		)
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);

		interface ExpressLikeRequest {
			get(name: string): string | undefined;
			query?: Record<string, string | string[]>;
			body?: unknown;
		}
		interface ExpressLikeResponse {
			status(code: number): ExpressLikeResponse;
			send(body: string): void;
			on(event: "close", listener: () => void): void;
		}
		const checkAuth = (
			req: ExpressLikeRequest,
			res: ExpressLikeResponse,
			next: () => void,
		) => {
			const headerKey =
				req.get("x-api-key") ?? req.get("X-API-Key") ?? undefined;
			const raw = req.query?.apiKey;

			let queryKey: string | undefined;
			if (typeof raw === "string") {
				queryKey = raw;
			} else if (Array.isArray(raw)) {
				queryKey = raw[0];
			} else {
				queryKey = undefined;
			}

			const provided = headerKey ?? queryKey;
			if (
				!provided ||
				(validKeys.length > 0 && !validKeys.includes(provided))
			) {
				res.status(401).send("Unauthorized: Invalid API Key");
				return;
			}
			next();
		};

		// Serve a minimal static demo UI from /public
		app.use(express.static("public"));

		type StreamableTransport = InstanceType<
			typeof StreamableHTTPServerTransport
		>;
		type NodeReq = Parameters<StreamableTransport["handleRequest"]>[0];
		type NodeRes = Parameters<StreamableTransport["handleRequest"]>[1];

		app.all(
			"/mcp",
			checkAuth,
			async (req: ExpressLikeRequest, res: ExpressLikeResponse) => {
				// Stateless transport per request
				const transport = new StreamableHTTPServerTransport({
					// Return JSON for simple request/response in demo UI
					enableJsonResponse: true,
				});
				await server.connect(transport);
				await transport.handleRequest(
					req as unknown as NodeReq,
					res as unknown as NodeRes,
					(req as unknown as { body?: unknown }).body,
				);
				res.on("close", () => {
					transport.close();
				});
			},
		);

		app.listen(port, () => {
			const keyInfo = validKeys.length
				? `${validKeys.length} API key(s) loaded`
				: "No VALID_API_KEYS configured";
			console.log(
				`UX Axioms MCP Server running at http://localhost:${port}/mcp (${keyInfo})`,
			);
		});
	}
}

try {
	await main();
} catch (error) {
	console.error(error);
}
