export interface Axiom {
	id: string;
	title: string;
	category: string;
	tags: string[];
	content: string;
	evidence_level: string;
	validated: boolean;
	last_updated: string;
	related_rules?: string[];
}
