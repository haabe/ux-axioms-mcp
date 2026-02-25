import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

type Front = {
  id?: string;
  title?: string;
  category?: string;
  tags?: string[];
  evidence_level?: string;
  validated?: boolean;
  last_updated?: string;
  related_rules?: string[];
  components?: string[];
  patterns?: string[];
  common_violations?: string[];
  fix_strategies?: string[];
};

function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9_\-\s]/g, ' ').split(/\s+/).filter(Boolean);
}

const rulesDir = path.resolve(process.cwd(), 'database', 'rules');
const overridesPath = path.resolve(process.cwd(), 'database', 'mappings', 'rule-overrides.json');
const overrides = fs.existsSync(overridesPath) ? JSON.parse(fs.readFileSync(overridesPath, 'utf-8')) as Record<string, Partial<Front>> : {};
const files = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));

type Entry = { file: string; id: string; title: string; tags: string[] };
const entries: Entry[] = [];

// First pass: load all
for (const file of files) {
  const filePath = path.join(rulesDir, file);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const gm = matter(raw);
  const data = gm.data as Front;
  const id = data.id || path.basename(file, '.md');
  const title = data.title || id;
  const tags = Array.from(new Set((data.tags || []).map(t => String(t).toLowerCase().trim())));
  entries.push({ file: filePath, id, title, tags });
}

// Build indices
const byId = new Map(entries.map(e => [e.id, e] as const));

// Category and evidence heuristics
const gestalt = new Set([
  'proximity','similarity','common_region','continuity','closure','figure_ground','common_fate'
]);
const typography = new Set(['readability_vs_legibility','line_length_cpl','line_height_leading']);
const scanning = new Set(['f_pattern_scanning','gutenberg_diagram']);
const performance = new Set(['doherty_threshold','the_3_second_rule']);
const service = new Set(['service_recovery_paradox','evidencing']);
const behavioralEconomics = new Set([
  'loss_aversion','anchoring_bias','framing_effect','scarcity_principle','sunk_cost_fallacy','decoy_effect','goal_gradient_effect'
]);
const cognitive = new Set([
  'hicks_law','fitts_law','millers_law','postels_law','jakobs_law','teslers_law','peak_end_rule','zeigarnik_effect','von_restorff_effect','recency_bias','confirmation_bias','false_consensus_bias','the_curse_of_knowledge','the_labor_illusion','similarity'
]);

function deriveCategory(id: string, tags: string[]): string {
  if (gestalt.has(id) || tags.includes('gestalt')) return 'gestalt_principles';
  if (typography.has(id) || tags.includes('typography')) return 'typography';
  if (scanning.has(id)) return 'information_scanning';
  if (performance.has(id) || tags.includes('performance')) return 'performance_and_feedback';
  if (service.has(id)) return 'service_design';
  if (behavioralEconomics.has(id) || tags.includes('economics')) return 'behavioral_economics';
  return 'cognitive_psychology_and_behavior';
}

function deriveEvidenceLevel(id: string): string {
  if (behavioralEconomics.has(id) || gestalt.has(id) || typography.has(id) || scanning.has(id) || performance.has(id) || cognitive.has(id)) {
    return 'established';
  }
  return 'unknown';
}

// Optional mapping files to enrich empty components/patterns/violations from tags or category
type StringArrayMap = Record<string, string[]>;
type ViolationsMap = Record<string, { common_violations?: string[]; fix_strategies?: string[] }>;

function readMap<T>(relPath: string, fallback: T): T {
  const p = path.resolve(process.cwd(), 'database', 'mappings', relPath);
  if (fs.existsSync(p)) {
    try { return JSON.parse(fs.readFileSync(p, 'utf-8')) as T; } catch {}
  }
  return fallback;
}

const componentsByTag = readMap<StringArrayMap>('components-by-tag.json', {
  navigation: ['menu', 'nav'],
  forms: ['form', 'input'],
  loading: ['spinner', 'skeleton']
});
const patternsByTag = readMap<StringArrayMap>('patterns-by-tag.json', {
  navigation: ['tabs', 'drawer', 'topnav'],
  forms: ['label-input', 'validation'],
  loading: ['skeleton', 'progress-indicator']
});
const violationsByTag = readMap<ViolationsMap>('violations-by-tag.json', {
  accessibility: {
    common_violations: ['missing labels', 'low contrast', 'no focus state'],
    fix_strategies: ['add label/aria', 'increase contrast', 'fix focus order']
  },
  forms: {
    common_violations: ['unclear labels', 'poor grouping'],
    fix_strategies: ['associate label with input', 'group related fields']
  },
  navigation: {
    common_violations: ['too many choices', 'nonstandard placement'],
    fix_strategies: ['group items', 'use common placement']
  },
  loading: {
    common_violations: ['no feedback under load'],
    fix_strategies: ['show skeleton/spinner', 'optimistic UI']
  }
});

const categoryDefaults: Record<string, { components?: string[]; patterns?: string[]; common_violations?: string[]; fix_strategies?: string[] }> = {
  gestalt_principles: {
    patterns: ['grouping', 'visual-hierarchy']
  },
  typography: {
    patterns: ['readability'],
    common_violations: ['too small font', 'long line length'],
    fix_strategies: ['14-16px body', '45-75 CPL']
  },
  information_scanning: {
    patterns: ['scan-patterns']
  },
  performance_and_feedback: {
    components: ['loading'],
    patterns: ['skeleton', 'optimistic-ui']
  },
  service_design: {
    patterns: ['error-recovery']
  },
  behavioral_economics: {
    patterns: ['nudges']
  },
  cognitive_psychology_and_behavior: {}
};

// Score relatedness by tags + title token overlap
function relatedFor(e: Entry): string[] {
  const myTags = new Set(e.tags);
  const myTitle = new Set(tokenize(e.title));
  const scores: Array<{ id: string; score: number }> = [];
  for (const other of entries) {
    if (other.id === e.id) continue;
    let score = 0;
    for (const t of other.tags) if (myTags.has(t)) score += 2;
    for (const tok of tokenize(other.title)) if (myTitle.has(tok)) score += 1;
    if (score > 0) scores.push({ id: other.id, score });
  }
  scores.sort((a,b) => b.score - a.score || a.id.localeCompare(b.id));
  return scores.slice(0, 6).map(s => s.id);
}

// Second pass: update files
for (const file of files) {
  const filePath = path.join(rulesDir, file);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const gm = matter(raw);
  const data = gm.data as Front;
  const id = data.id || path.basename(file, '.md');
  const title = data.title || id;
  const tags = Array.from(new Set((data.tags || []).map(t => String(t).toLowerCase().trim())));

  // compute related if missing or empty
  let related = Array.isArray(data.related_rules) ? data.related_rules.slice() : [];
  if (related.length === 0) {
    const rel = relatedFor({ file: filePath, id, title, tags });
    related = rel;
  }

  // normalize last_updated if missing
  const last_updated = data.last_updated || new Date().toISOString();

  // derive/override category/evidence/validated
  const ov = overrides[id] || {};
  const category = ov.category || (data.category && data.category !== 'uncategorized' ? data.category : deriveCategory(id, tags));
  const evidence_level = ov.evidence_level || (data.evidence_level && data.evidence_level !== 'unknown' ? data.evidence_level : deriveEvidenceLevel(id));
  const validated = ov.validated !== undefined ? ov.validated : (data.validated !== undefined ? data.validated : (evidence_level === 'established' || evidence_level === 'strong'));

  // merge tags with overrides
  const mergedTags = Array.from(new Set([...(tags || []), ...((ov.tags as string[] | undefined) || [])]));

  // merge related_rules with overrides
  const mergedRelated = Array.from(new Set([...(related || []), ...(((ov.related_rules as string[] | undefined) || []))])).filter(r => r !== id);

  // merge optional arrays (start from existing or empty)
  const components = Array.isArray(data.components) ? [...data.components] : [];
  const patterns = Array.isArray(data.patterns) ? [...data.patterns] : [];
  const common_violations = Array.isArray(data.common_violations) ? [...data.common_violations] : [];
  const fix_strategies = Array.isArray(data.fix_strategies) ? [...data.fix_strategies] : [];
  if (Array.isArray(ov.components)) components.push(...ov.components);
  if (Array.isArray(ov.patterns)) patterns.push(...ov.patterns);
  if (Array.isArray(ov.common_violations)) common_violations.push(...ov.common_violations);
  if (Array.isArray(ov.fix_strategies)) fix_strategies.push(...ov.fix_strategies);

  // tag-based enrichment
  for (const t of tags) {
    if (componentsByTag[t]) components.push(...componentsByTag[t]);
    if (patternsByTag[t]) patterns.push(...patternsByTag[t]);
    const v = violationsByTag[t];
    if (v?.common_violations) common_violations.push(...v.common_violations);
    if (v?.fix_strategies) fix_strategies.push(...v.fix_strategies);
  }

  // category defaults if still empty
  const catDef = categoryDefaults[deriveCategory(id, tags)] || {};
  if (components.length === 0 && catDef.components) components.push(...catDef.components);
  if (patterns.length === 0 && catDef.patterns) patterns.push(...catDef.patterns);
  if (common_violations.length === 0 && catDef.common_violations) common_violations.push(...catDef.common_violations);
  if (fix_strategies.length === 0 && catDef.fix_strategies) fix_strategies.push(...catDef.fix_strategies);

  const next: Front = {
    id,
    title,
    category,
    evidence_level,
    validated,
    last_updated,
    tags: mergedTags,
    related_rules: mergedRelated,
    components: Array.from(new Set(components)),
    patterns: Array.from(new Set(patterns)),
    common_violations: Array.from(new Set(common_violations)),
    fix_strategies: Array.from(new Set(fix_strategies)),
  };

  // Write back preserving body
  const out = matter.stringify(gm.content.trim() + '\n', next);
  fs.writeFileSync(filePath, out);
}

console.log(`Enriched ${files.length} rule files.`);
