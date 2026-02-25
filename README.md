# UX Axioms MCP Server

An MCP server that exposes UX Axioms parsed from `database/rules/*.md` as Resources and Tools. It supports:
- STDIO for Kiro / VS Code MCP clients (npx-style launch)
- Streamable HTTP (SSE) for a simple browser demo

The repo ships CI (lint/build/test) and npm Trusted Publishing (OIDC) to publish securely without classic tokens.

## Install & Build

```bash
pnpm install   # or: npm install
pnpm build     # or: npm run build
```

Output is ESM in `dist/`.

## Run via npx (MCP stdio)

Add this to your MCP client (Kiro / VS Code) configuration to match other servers like Snyk:

```json
"ux-axioms": {
  "command": "npx",
  "args": ["-y", "ux-axioms-mcp@latest", "mcp", "-t", "stdio"]
}
```

Alternate form is also supported:

```json
"args": ["-y", "ux-axioms-mcp@latest", "--stdio"]
```

Local, without publishing:

```bash
pnpm build
npx ux-axioms-mcp@file:. mcp -t stdio
# or
npx ux-axioms-mcp@file:. --stdio
```

## Local Run (direct)

- STDIO
  ```bash
  pnpm build
  node dist/src/index.js --stdio
  ```

- HTTP + SSE (optional API key auth)
  ```bash
  # .env or environment
  # VALID_API_KEYS=key1,key2
  pnpm build
  node dist/src/index.js
  # -> http://localhost:3000/mcp
  ```
  - Auth header: `X-API-Key: <key>` or query: `?apiKey=<key>`
  - A minimal demo page is served from `public/`

On boot you’ll see which rules directory is used, e.g.:

```
Axioms: using rules dir: /…/ux-axioms-mcp/database/rules with 45 file(s)
```

## Resources

- `axioms://list` – all axioms as JSON
- `axioms://search/{keyword}` – filter by title/content/tags

## Tools

- `list_axioms({ keyword?: string, limit?: number })`
  - List or filter axioms; keyword matches title/content/tags
- `get_axiom({ id: string })`
  - Fetch a single axiom by id (file stem)
- `suggest_axioms({ task?: string, component?: string, persona?: string, keywords?: string[], limit?: number })`
  - Recommends using axiom tags, related_rules, and curated mappings in `database/mappings/*`
- `recommend_for_task({ task: string, persona?: string })`
  - Curated suggestions via `database/mappings/tasks.json`
- `prioritize_axioms({ persona: string })`
  - Persona-prioritized ordering via `database/mappings/personas.json`
- `analyze_ui({ html: string })`
  - Naive static checks (Fitts’s min size, Hick’s choices, labels, small fonts)
- `generate_spec({ task: string, context?: string, persona?: string })`
  - Spec section with axiom-driven constraints and acceptance criteria
- `generate_tests({ framework: 'playwright'|'jest-axe'|'vitest' })`
  - Test scaffolds (hit area checks, a11y shell, timing shell)
- `link_patterns({ html?: string, code?: string })`
  - Infers tags from patterns and expands to related axioms

## Configuration

- `RULES_DIR` – optional absolute or repo-relative path to rules (default `database/rules`)
- `VALID_API_KEYS` – optional comma-separated list for HTTP auth

## Project Structure

```
ux-axioms-mcp/
├── src/
│   ├── loader.ts           # Markdown → objects
│   ├── index.ts            # MCP server: resources + tools + transports
│   └── types.ts            # Types
├── scripts/
│   ├── mcp.ts              # npx entry (stdio)
│   └── cli.ts              # Minimal test client
├── public/                 # Minimal web demo (HTTP)
├── database/               # Rules + mapping JSON
├── specs/                  # Design/plan/tasks
├── .github/workflows/      # CI + publish (Trusted Publishing)
└── tsconfig.json
```

## CI/CD (GitHub Actions) & Publishing (npm OIDC)

- CI: `.github/workflows/ci.yml` runs install, lint, build, test
- Publish: `.github/workflows/publish.yml` publishes on tags `v*` using npm Trusted Publishing (OIDC)
  - In npm, configure a Trusted Publisher pointing to this repo and workflow path
  - Release steps:
    1) Bump version in `package.json`
    2) `git tag vX.Y.Z && git push origin vX.Y.Z`

## Enriching rule frontmatter

Metadata like `category`, `evidence_level`, `validation`, `tags`, `related_rules`, `components`, `patterns`, `common_violations`, `fix_strategies` is used by tools such as `suggest_axioms` and `link_patterns`.

```bash
pnpm build
node dist/scripts/enrich-frontmatter.js
```

The enrichment augments missing fields but preserves any manually curated values.

## Troubleshooting

- No tools/resources in client:
  - Ensure you launch via `npx ux-axioms-mcp@latest mcp -t stdio`
  - Look for “UX Axioms MCP Server running on STDIO” in logs
- Rules directory warnings:
  - Verify `RULES_DIR` or keep default `database/rules`
- Missing dependencies:
  - `pnpm install` then `pnpm build`

