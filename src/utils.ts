export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replaceAll(/[^a-z0-9_\-\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
