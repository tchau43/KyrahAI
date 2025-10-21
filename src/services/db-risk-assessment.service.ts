// src/services/db-risk-assessment.service.ts
import { createClient } from '@/utils/supabase/server';
import type {
  RiskAssessmentOutput,
  Resource,
  RiskLevel,
  Audience,
} from '@/types/risk-assessment';

const RISK_ORDER: RiskLevel[] = ['low', 'medium', 'high'] as const;
const rank = (b: RiskLevel) => RISK_ORDER.indexOf(b);
const bandsAtOrBelow = (level: RiskLevel) => {
  const idx = rank(level);
  return RISK_ORDER.slice(0, Math.max(0, idx + 1));
};

/**
 * Map language to jurisdiction priority
 */
const LANGUAGE_TO_JURISDICTION: Record<string, string[]> = {
  'en': ['US', 'international'],
  'vi': ['Vietnam', 'international'],
  'zh': ['China', 'international'],
  'ja': ['Japan', 'international'],
};

/**
 * Save risk assessment to database
 */
export async function saveRiskAssessment(
  messageId: string,
  sessionId: string,
  assessment: RiskAssessmentOutput,
  modelVersion: string = 'v1.0'
) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('risk_assessments')
      .insert({
        message_id: messageId,
        session_id: sessionId,
        flags: assessment.flags,
        risk_level: assessment.risk_level,
        confidence: assessment.confidence,
        indicators: assessment.indicators,
        assessed_at: new Date().toISOString(),
        model_version: modelVersion,
        metadata: {
          analysis_notes: assessment.analysis_notes,
          recommended_resource_topics: assessment.recommended_resource_topics,
          requires_immediate_cards: assessment.requires_immediate_cards,
          detected_audiences: assessment.detected_audiences,
        },
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get user language and timezone from preferences
 */
async function getUserLocale(userId?: string): Promise<{ language: string; timezone: string; jurisdiction: string[] }> {
  const supabase = await createClient();

  const defaultLocale = {
    language: 'en',
    timezone: 'America/New_York',
    jurisdiction: LANGUAGE_TO_JURISDICTION['en'],
  };

  if (!userId) {
    return defaultLocale;
  }

  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('language, timezone')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return defaultLocale;
    }

    return {
      language: data.language || 'en',
      timezone: data.timezone || 'America/New_York',
      jurisdiction: LANGUAGE_TO_JURISDICTION[data.language] || LANGUAGE_TO_JURISDICTION['en'],
    };
  } catch (error) {
    console.error('Error fetching user locale:', error);
    return defaultLocale;
  }
}

const AUDIENCE_TOPIC_MAP: Record<Audience, string[]> = {
  // LGBTQ+ Community
  'lgbtq+': ['culturally_specific_support', 'advocacy_resources', 'sogi_protection'],
  'lgbtqi_youth': ['culturally_specific_support', 'advocacy_resources', 'sogi_protection', 'child_protection'],
  'transgender': ['culturally_specific_support', 'advocacy_resources', 'sogi_protection'],
  'general_lgbtq+': ['culturally_specific_support', 'advocacy_resources'],

  // Children & Youth
  'youth': ['child_protection', 'mental_health', 'digital_safety'],
  'youth_teens': ['child_protection', 'mental_health', 'digital_safety'],
  'children_youth': ['child_protection', 'mental_health', 'digital_safety'],

  // Elderly
  'elderly': ['elder_care', 'mental_health', 'health_equity'],

  // People with Disabilities
  'disabled': ['culturally_specific_support', 'accessibility_services', 'health_equity'],
  'disabilities': ['culturally_specific_support', 'accessibility_services', 'health_equity'],
  'deaf_hard_of_hearing': ['culturally_specific_support', 'accessibility_services', 'health_equity'],

  // Racial & Ethnic Minorities
  'racial_minorities': ['culturally_specific_support', 'racial_justice', 'health_equity'],
  'ethnic_minorities': ['culturally_specific_support', 'racial_justice', 'health_equity'],
  'indigenous': ['culturally_specific_support', 'racial_justice', 'indigenous_rights', 'health_equity'],
  'indigenous_native_american': ['culturally_specific_support', 'racial_justice', 'indigenous_rights', 'health_equity'],
  'black_african_american': ['culturally_specific_support', 'racial_justice', 'health_equity'],

  // Asian American & Pacific Islander
  'aapi': ['culturally_specific_support', 'advocacy_resources'],

  // Refugees & Immigrants
  'refugees': ['refugee_protection', 'culturally_specific_support', 'legal_help', 'mental_health'],
  'immigrants': ['refugee_protection', 'culturally_specific_support', 'legal_help', 'mental_health'],

  // Women & Girls
  'women': ['women_protection', 'advocacy_resources', 'safety_planning'],
  'women_girls': ['women_protection', 'advocacy_resources', 'safety_planning', 'child_protection'],
  'women_children': ['women_protection', 'advocacy_resources', 'safety_planning', 'child_protection'],

  // Men & Boys
  'men': ['prevention', 'cultural_transformation', 'gender_equality'],
  'men_boys': ['prevention', 'cultural_transformation', 'gender_equality', 'child_protection'],
  'men_fathers': ['prevention', 'cultural_transformation', 'gender_equality', 'parenting_support'],

  // Male Survivors
  'male_survivors': ['conflict_violence', 'mental_health', 'culturally_specific_support'],

  // Parents & Caregivers
  'parents': ['parenting_support', 'prevention', 'child_protection'],

  // Workers & Employment
  'workers': ['workplace_rights', 'employment', 'prevention'],

  // Veterans & Military
  'veterans_military': ['crisis_intervention', 'mental_health', 'veteran_services'],

  // Sexual Assault Survivors
  'sexual_assault_survivors': ['crisis_intervention', 'medical_response', 'legal_help', 'safety_planning'],

  // Low Income
  'low_income': ['financial_assistance', 'financial_abuse', 'legal_help'],

  // General
  'general': ['safety_planning', 'awareness', 'crisis_intervention'],
};

/**
 * Map risk assessment flags to resource topics with audience-specific support
 */
function mapFlagsToTopics(assessment: RiskAssessmentOutput): string[] {
  const topics: string[] = [];
  const detectedAudiences = assessment.detected_audiences;

  // ========================================
  // HIGH PRIORITY TOPICS (life-threatening)
  // ========================================
  if (assessment.flags.self_harm || assessment.requires_immediate_cards) {
    topics.push(
      'crisis_intervention',
      'mental_health',
      'safety_planning'
    );
  }

  if (assessment.flags.imminent_danger || assessment.flags.physical) {
    topics.push(
      'crisis_intervention',
      'domestic_violence',
      'emergency_response',
      'shelter_housing',
      'safety_planning',
      'emergency_services'
    );
  }

  // ========================================
  // MEDIUM PRIORITY TOPICS
  // ========================================
  if (assessment.flags.sexual) {
    topics.push(
      'crisis_intervention',
      'safety_planning'
    );
  }

  if (assessment.flags.emotional || assessment.flags.gaslighting) {
    topics.push(
      'mental_health',
      'safety_planning'
    );
  }

  if (assessment.flags.digital) {
    topics.push(
      'digital_safety',
      'digital_violence',
      'safety_planning'
    );
  }

  // ========================================
  // LOW PRIORITY TOPICS
  // ========================================
  if (assessment.flags.legal) {
    topics.push('legal_help');
  }

  if (assessment.flags.financial) {
    topics.push('financial_abuse');
  }

  // ========================================
  // Uses centralized mapping (no more scattered string literals)
  // ========================================
  for (const audience of detectedAudiences) {
    const audienceTopics = AUDIENCE_TOPIC_MAP[audience];
    if (audienceTopics) {
      topics.push(...audienceTopics);
    }
  }

  // ========================================
  // FALLBACK
  // ========================================
  if (topics.length === 0) {
    topics.push('safety_planning', 'awareness', 'crisis_intervention');
  }

  // Remove duplicates and return
  return [...new Set(topics)];
}

/**
 * Fetch relevant resources based on assessment with localization
 */
export async function fetchRelevantResources(
  assessment: RiskAssessmentOutput,
  limit: number = 5,
  userId?: string
): Promise<Resource[]> {
  try {
    const supabase = await createClient();

    // Get user locale preferences
    const { jurisdiction: jurisdictionPriority } = await getUserLocale(userId);

    // Map flags to topics
    const topics = mapFlagsToTopics(assessment);

    const detectedAudiences = assessment.detected_audiences;

    // Check if resources are expired (> 12 months old)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Priority 1: Try to fetch with jurisdiction, topic, and risk_band
    let resources: Resource[] = [];

    for (const jurisdiction of jurisdictionPriority) {
      const audienceFilter = [...detectedAudiences, 'general'];

      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .in('topic', topics)
        .eq('jurisdiction', jurisdiction)
        .in('audience', audienceFilter)
        .eq('is_active', true)
        .in('risk_band', bandsAtOrBelow(assessment.risk_level))
        .gte('last_verified', twelveMonthsAgo.toISOString().split('T')[0])
        .eq('display_as_card', true)
        .limit(limit);

      if (error) {
        console.error(`Error fetching resources for ${jurisdiction}:`, error);
        continue;
      }

      function shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      }

      if (data && data.length > 0) {
        const shuffledData = shuffleArray(data);
        const audienceSpecific = shuffledData.filter(r => detectedAudiences.includes(r.audience as Audience));
        const general = shuffledData.filter(r => r.audience === 'general');
        resources = [...audienceSpecific, ...general].slice(0, limit);
        break;
      }
    }

    // Priority 2: If no exact match, try without risk_band filter
    if (resources.length === 0) {
      for (const jurisdiction of jurisdictionPriority) {
        const audienceFilter = [...detectedAudiences, 'general'];
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .in('topic', topics)
          .eq('jurisdiction', jurisdiction)
          .in('audience', audienceFilter)
          .eq('is_active', true)
          .gte('last_verified', twelveMonthsAgo.toISOString().split('T')[0])
          .eq('display_as_card', true)
          .limit(limit);

        if (error) {
          console.error(`Error fetching resources (no risk filter) for ${jurisdiction}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          const audienceSpecific = data.filter(r => detectedAudiences.includes(r.audience as Audience));
          const general = data.filter(r => r.audience === 'general');
          resources = [...audienceSpecific, ...general].slice(0, limit);
          break;
        }
      }
    }

    // Priority 3: Fallback to UNICEF/International resources
    if (resources.length === 0) {
      const audienceFilter = [...detectedAudiences, 'general'];

      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .in('topic', topics)
        .eq('jurisdiction', 'international')
        .in('audience', audienceFilter)
        .eq('is_active', true)
        .gte('last_verified', twelveMonthsAgo.toISOString().split('T')[0])
        .eq('display_as_card', true)
        .order('risk_band', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching UNICEF fallback resources:', error);
        return [];
      }
      const audienceSpecific = (data || []).filter(r => detectedAudiences.includes(r.audience as Audience));
      const general = (data || []).filter(r => r.audience === 'general');
      resources = [...audienceSpecific, ...general].slice(0, limit);
    }
    return resources;
  } catch (error) {
    console.error('Failed to fetch resources:', error);
    return [];
  }
}

/**
 * Log resource display for analytics
 */
export async function logResourceDisplay(
  sessionId: string,
  messageId: string,
  resourceId: string,
  displayType: 'card' | 'inline' | 'list' = 'card'
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from('resource_displays').insert({
      session_id: sessionId,
      message_id: messageId,
      resource_id: resourceId,
      display_type: displayType,
      displayed_at: new Date().toISOString(),
      clicked: false,
    });

    if (error) {
      console.error('Error logging resource display:', error);
    } else {
      console.log('Resource display logged:', resourceId);
    }
  } catch (error) {
    console.error('Failed to log resource display:', error);
  }
}

/**
 * Get risk assessment history for a session
 */
export async function getRiskAssessmentHistory(sessionId: string, limit: number = 10) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('session_id', sessionId)
      .order('assessed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch risk assessment history:', error);
    return [];
  }
}

/**
 * Get highest risk level in session
 */
export async function getSessionMaxRiskLevel(sessionId: string): Promise<RiskLevel> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('risk_assessments')
      .select('risk_level')
      .eq('session_id', sessionId)
      .order('assessed_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return 'low';
    }

    // Determine highest risk level
    const riskLevels = data.map((a) => a.risk_level);
    if (riskLevels.includes('high')) return 'high';
    if (riskLevels.includes('medium')) return 'medium';
    return 'low';
  } catch (error) {
    console.error('Failed to get session max risk level:', error);
    return 'low';
  }
}