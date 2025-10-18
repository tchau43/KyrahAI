// src/services/db-risk-assessment.service.ts
import { createClient } from '@/utils/supabase/server';
import type { RiskAssessmentOutput, Resource, RiskLevel } from '@/types/risk-assessment';

// Define once near top (after imports)
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
  'vi': ['VN', 'international'],
  'zh': ['CN', 'international'],
  'ja': ['JP', 'international'],
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

  // Default to Vietnamese locale
  const defaultLocale = {
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    jurisdiction: LANGUAGE_TO_JURISDICTION['vi'],
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
      language: data.language || 'vi',
      timezone: data.timezone || 'Asia/Ho_Chi_Minh',
      jurisdiction: LANGUAGE_TO_JURISDICTION[data.language] || LANGUAGE_TO_JURISDICTION['vi'],
    };
  } catch (error) {
    console.error('Error fetching user locale:', error);
    return defaultLocale;
  }
}

/**
 * Map risk assessment flags to resource topics (matching ACTUAL DB schema from Resources.json)
 */
function mapFlagsToTopics(assessment: RiskAssessmentOutput): string[] {
  const topics: string[] = [];

  // HIGH PRIORITY TOPICS (life-threatening)
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

  // MEDIUM PRIORITY TOPICS
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
      'safety_planning'
    );
  }

  // LOW PRIORITY TOPICS
  if (assessment.flags.legal) {
    topics.push(
      'legal_help'
    );
  }

  if (assessment.flags.financial) {
    topics.push(
      'financial_abuse'
    );
  }

  // FALLBACK
  if (topics.length === 0) {
    topics.push(
      'safety_planning',
      'awareness'
    );
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

    // Check if resources are expired (> 12 months old)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Priority 1: Try to fetch with jurisdiction, topic, and risk_band
    let resources: Resource[] = [];

    for (const jurisdiction of jurisdictionPriority) {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .in('topic', topics)
        .eq('jurisdiction', jurisdiction)
        .eq('is_active', true)
        .in('risk_band', bandsAtOrBelow(assessment.risk_level)) // risk band at or below
        .gte('last_verified', twelveMonthsAgo.toISOString().split('T')[0]) // Not expired
        .eq('display_as_card', true) // Only displayable cards
        .limit(limit);

      if (error) {
        continue;
      }

      if (data && data.length > 0) {
        resources = data;
        break;
      }
    }

    // Priority 2: If no exact match, try without risk_band filter
    if (resources.length === 0) {
      for (const jurisdiction of jurisdictionPriority) {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .in('topic', topics)
          .eq('jurisdiction', jurisdiction)
          .eq('is_active', true)
          .gte('last_verified', twelveMonthsAgo.toISOString().split('T')[0])
          .eq('display_as_card', true)
          .limit(limit);

        if (error) {
          console.error(`Error fetching resources (no risk filter) for ${jurisdiction}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          resources = [...data].sort(
            (a, b) =>
              rank(b.risk_band) - rank(a.risk_band) ||
              new Date(b.last_verified).getTime() - new Date(a.last_verified).getTime()
          );
          break;
        }
      }
    }

    // Priority 3: Fallback to UNICEF/International resources
    if (resources.length === 0) {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .in('topic', topics)
        .eq('jurisdiction', 'international')
        .eq('is_active', true)
        .gte('last_verified', twelveMonthsAgo.toISOString().split('T')[0])
        .eq('display_as_card', true)
        .limit(limit);

      if (error) {
        console.error('Error fetching UNICEF fallback resources:', error);
        return [];
      }
      resources = data
        ? [...data].sort(
          (a, b) =>
            rank(b.risk_band) - rank(a.risk_band) ||
            new Date(b.last_verified).getTime() - new Date(a.last_verified).getTime()
        )
        : [];
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