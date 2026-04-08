# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run

```bash
pnpm install          # install dependencies
pnpm build            # tsc → dist/, makes dist/scripts/mcp.js executable
```

Run locally:
```bash
pnpm start            # HTTP+SSE on localhost:3000/mcp
pnpm start:stdio      # STDIO transport (for MCP clients)
```

There are no tests or linters configured yet — CI runs `pnpm run --if-present lint` and `pnpm run --if-present test` (both no-op currently).

## Architecture

This is an MCP (Model Context Protocol) server that exposes UX design axioms as resources and tools. It uses `@modelcontextprotocol/sdk` and supports two transports:

- **STDIO** — for IDE MCP clients (Kiro, VS Code). Entry: `scripts/mcp.ts` → imports `src/index.ts` with `--stdio` flag.
- **Streamable HTTP** — Express server with optional API key auth (`VALID_API_KEYS` env). Serves a demo UI from `public/`.

### Data flow

1. **`src/loader.ts`** reads markdown files from `database/rules/*.md`, parses YAML frontmatter via `gray-matter`, and returns `Axiom[]`. Rules dir is resolved via `RULES_DIR` env or auto-detected relative to the executing file.

2. **`src/index.ts`** is the main server. On startup it loads all axioms, builds an in-memory tag index and id map, then registers MCP resources and tools. All tool logic (ranking, mapping lookups, HTML analysis) lives inline in this single file.

3. **`database/mappings/*.json`** provides curated lookup tables (personas, components, tasks, patterns-by-tag, etc.) used by `suggest_axioms`, `recommend_for_task`, and `prioritize_axioms` tools to map high-level queries to axiom IDs/tags.

### Key types

- `src/types.ts` — canonical `Axiom` interface used by loader and server (id, title, category, tags, content, evidence_level, validated, last_updated, related_rules)
- `src/types/axiom.ts` — alternate simpler `Axiom` type (slug, title, axiom, science, application) — appears unused by the main server

### Scripts

- `scripts/mcp.ts` — npx entry point, parses args and delegates to `src/index.ts`
- `scripts/cli.ts` — minimal test client for manual verification
- `scripts/enrich-frontmatter.ts` — augments rule markdown files with missing metadata fields (`pnpm enrich`)

## Publishing

npm publishing uses GitHub Actions with OIDC Trusted Publishing (`.github/workflows/publish.yml`). Release by bumping `package.json` version, tagging `vX.Y.Z`, and pushing the tag.
