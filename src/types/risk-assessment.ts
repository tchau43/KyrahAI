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

export interface RiskAssessmentOutput {
  flags: RiskFlags;
  risk_level: RiskLevel;
  confidence: number;
  indicators: RiskIndicator[];
  analysis_notes: string;
  recommended_resource_topics: string[];
  requires_immediate_cards: boolean;
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