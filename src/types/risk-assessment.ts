// src/types/risk-assessment.ts

export interface RiskFlags {
  legal: boolean;
  sexual: boolean;
  digital: boolean;
  physical: boolean;
  emotional: boolean;
  financial: boolean;
  self_harm: boolean;
  gaslighting: boolean;
  imminent_danger: boolean;
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type Severity = 'low' | 'medium' | 'high';

export interface RiskIndicator {
  indicator_id: string;
  matched_phrases: string[];
  flag_category: string;
  severity: Severity;
}

export const AUDIENCES = [
  'general',
  'youth',
  'youth_teens',
  'children_youth',
  'lgbtq+',
  'lgbtqi_youth',
  'transgender',
  'women',
  'women_girls',
  'women_children',
  'men',
  'men_boys',
  'men_fathers',
  'elderly',
  'disabled',
  'disabilities',
  'deaf_hard_of_hearing',
  'refugees',
  'immigrants',
  'indigenous',
  'indigenous_native_american',
  'ethnic_minorities',
  'racial_minorities',
  'black_african_american',
  'aapi',
  'workers',
  'parents',
  'veterans_military',
  'sexual_assault_survivors',
  'male_survivors',
  'general_lgbtq+',
  'low_income',
] as const;

export type Audience = (typeof AUDIENCES)[number];

export const AUDIENCE_ALIASES: Record<string, Audience[]> = {
  'latinx_hispanic': ['ethnic_minorities', 'racial_minorities'],
  'elderly_general': ['elderly'],
  'men_refugees': ['men', 'refugees'],
  'advocates_providers': ['general'],
  'policymakers': ['general'],
  'expats': ['general'],
  'lgbtq_refugees': ['lgbtq+', 'refugees'],
  'disabled_adolescents': ['disabled', 'youth'],
  'african_descent': ['black_african_american'],
  'women_youth_lowincome': ['women', 'youth', 'low_income'],
  'women_activists': ['women'],
  'women_journalists': ['women'],
  'refugees_minorities_disabled': ['refugees', 'ethnic_minorities', 'disabled'],
  'crisis': ['general'],
  'healthcare': ['general'],
  'researchers': ['general'],
  'employers': ['general'],
  'children': ['children_youth'],
};

/**
 * Normalize audience labels to canonical set
 */
export function normalizeAudiences(raw: string[]): Audience[] {
  const normalized = new Set<Audience>();

  for (const label of raw) {
    if (AUDIENCES.includes(label as Audience)) {
      normalized.add(label as Audience);
      continue;
    }

    const aliases = AUDIENCE_ALIASES[label];
    if (aliases) {
      aliases.forEach((a) => normalized.add(a));
    } else {
      console.warn(`⚠️ Unknown audience label: ${label}, defaulting to 'general'`);
      normalized.add('general');
    }
  }

  return [...normalized];
}

export interface RiskAssessmentOutput {
  flags: RiskFlags;
  risk_level: RiskLevel;
  confidence: number;
  indicators: RiskIndicator[];
  analysis_notes: string;
  recommended_resource_topics: string[];
  requires_immediate_cards: boolean;
  detected_audiences: Audience[];
}

export interface RiskAssessmentResponse {
  success: boolean;
  data: RiskAssessmentOutput;
  error?: string;
}

// Database types
export interface RiskAssessmentDB {
  assessment_id: string;
  message_id: string;
  session_id: string;
  flags: RiskFlags;
  risk_level: RiskLevel;
  confidence: number;
  indicators: RiskIndicator[];
  assessed_at: string;
  model_version: string;
  metadata: {
    analysis_notes: string;
    recommended_resource_topics: string[];
    requires_immediate_cards: boolean;
    detected_audiences: Audience[];
  };
}

export interface Indicator {
  id: string;
  flag: string;
  indicators: string[];
  risk_meter: RiskLevel;
}

export interface Resource {
  resource_id: string;
  title: string;
  content: string;
  jurisdiction: string;
  audience: string;
  topic: string;
  risk_band: RiskLevel;
  publisher: string;
  last_verified: string;
  source_url: string | null;
  display_as_card: boolean;
  do_not_paraphrase: boolean;
  card_data: ResourceCardData;
  is_active: boolean;
}

export interface ResourceCardData {
  hotline?: string;
  email?: string;
  address?: string;
  availability?: string;
  languages?: string[];
  services?: string[];
  website?: string;
}