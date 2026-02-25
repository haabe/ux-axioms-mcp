import { Client as MCPClient } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["dist/src/index.js", "--stdio"],
  });

  const client = new MCPClient({ name: "ux-axioms-cli", version: "1.0.0" });

  await client.connect(transport);

  // List resources to verify server is up
  const list = await client.listResources();
  console.log("Resources:", list.resources.map((r: any) => r.name));

  // Read full list
  const full = await client.readResource({ uri: "axioms://list" });
  const fullText = (full.contents[0] as any).text ?? Buffer.from((full.contents[0] as any).blob, 'base64').toString('utf-8');
  console.log("Axioms count:", JSON.parse(fullText).length);

  // Search example
  const term = process.argv[2] || "user";
  const search = await client.readResource({ uri: `axioms://search/${encodeURIComponent(term)}` });
  const searchText = (search.contents[0] as any).text ?? Buffer.from((search.contents[0] as any).blob, 'base64').toString('utf-8');
  const results = JSON.parse(searchText);
  console.log(`Matches for "${term}":`, results.length);

  await client.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
