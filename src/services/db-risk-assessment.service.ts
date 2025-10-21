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
          detected_audiences: assessment.detected_audiences || ['general'],
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
 * Map risk assessment flags to resource topics with audience-specific support
 */
function mapFlagsToTopics(assessment: RiskAssessmentOutput): string[] {
  const topics: string[] = [];
  const detectedAudiences = assessment.detected_audiences || [];

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
    topics.push(
      'legal_help'
    );
  }

  if (assessment.flags.financial) {
    topics.push(
      'financial_abuse'
    );
  }

  // ========================================
  // AUDIENCE-SPECIFIC TOPICS
  // ========================================

  // LGBTQ+ Community
  if (detectedAudiences.some(a => ['lgbtq+', 'lgbtqi_youth', 'transgender', 'lgbtq_refugees'].includes(a))) {
    topics.push(
      'culturally_specific_support',
      'advocacy_resources',
      'sogi_protection'
    );
  }

  // Children & Youth
  if (detectedAudiences.some(a => ['children', 'youth', 'youth_teens', 'children_youth'].includes(a))) {
    topics.push(
      'child_protection',
      'mental_health',
      'digital_safety'
    );
  }

  // Elderly
  if (detectedAudiences.some(a => ['elderly', 'elderly_general'].includes(a))) {
    topics.push(
      'elder_care',
      'mental_health',
      'health_equity'
    );
  }

  // People with Disabilities
  if (detectedAudiences.some(a => ['disabled', 'disabled_adolescents', 'disabilities', 'deaf_hard_of_hearing'].includes(a))) {
    topics.push(
      'culturally_specific_support',
      'accessibility_services',
      'health_equity'
    );
  }

  // Racial & Ethnic Minorities
  if (detectedAudiences.some(a => ['racial_minorities', 'ethnic_minorities', 'indigenous', 'indigenous_native_american', 'african_descent', 'black_african_american'].includes(a))) {
    topics.push(
      'culturally_specific_support',
      'racial_justice',
      'indigenous_rights',
      'health_equity'
    );
  }

  // Asian American & Pacific Islander (AAPI)
  if (detectedAudiences.includes('aapi')) {
    topics.push(
      'culturally_specific_support',
      'advocacy_resources'
    );
  }

  // Latinx & Hispanic
  if (detectedAudiences.includes('latinx_hispanic')) {
    topics.push(
      'culturally_specific_support',
      'advocacy_resources'
    );
  }

  // Refugees & Immigrants
  if (detectedAudiences.some(a => ['refugees', 'men_refugees', 'immigrants', 'lgbtq_refugees', 'refugees_minorities_disabled'].includes(a))) {
    topics.push(
      'refugee_protection',
      'culturally_specific_support',
      'legal_help',
      'mental_health'
    );
  }

  // Women & Girls
  if (detectedAudiences.some(a => ['women', 'women_children', 'women_girls', 'women_youth_lowincome', 'women_activists', 'women_journalists'].includes(a))) {
    topics.push(
      'women_protection',
      'advocacy_resources',
      'safety_planning'
    );
  }

  // Men & Boys (Prevention & Engagement)
  if (detectedAudiences.some(a => ['men_boys', 'men_fathers'].includes(a))) {
    topics.push(
      'prevention',
      'cultural_transformation',
      'gender_equality'
    );
  }

  // Male Survivors
  if (detectedAudiences.includes('male_survivors')) {
    topics.push(
      'conflict_violence',
      'mental_health',
      'culturally_specific_support'
    );
  }

  // Parents & Caregivers
  if (detectedAudiences.includes('parents')) {
    topics.push(
      'parenting_support',
      'prevention',
      'child_protection'
    );
  }

  // Workers & Employment
  if (detectedAudiences.some(a => ['workers', 'employers'].includes(a))) {
    topics.push(
      'workplace_rights',
      'employment',
      'prevention'
    );
  }

  // Veterans & Military
  if (detectedAudiences.includes('veterans_military')) {
    topics.push(
      'crisis_intervention',
      'mental_health',
      'veteran_services'
    );
  }

  // Crisis & Emergency Situations
  if (detectedAudiences.includes('crisis')) {
    topics.push(
      'emergency_response',
      'crisis_intervention',
      'shelter_housing'
    );
  }

  // Sexual Assault Survivors
  if (detectedAudiences.includes('sexual_assault_survivors')) {
    topics.push(
      'crisis_intervention',
      'medical_response',
      'legal_help',
      'safety_planning'
    );
  }

  // Healthcare Professionals
  if (detectedAudiences.includes('healthcare')) {
    topics.push(
      'medical_response',
      'training_resources'
    );
  }

  // Policymakers & Advocates
  if (detectedAudiences.some(a => ['policymakers', 'researchers', 'advocates_providers'].includes(a))) {
    topics.push(
      'policy_framework',
      'policy_advocacy',
      'data_measurement',
      'prevention_framework'
    );
  }

  // Low Income & Financial Hardship
  if (detectedAudiences.includes('low_income')) {
    topics.push(
      'financial_assistance',
      'financial_abuse',
      'legal_help'
    );
  }

  // Expats & International Communities
  if (detectedAudiences.includes('expats')) {
    topics.push(
      'crisis_intervention',
      'culturally_specific_support'
    );
  }

  // ========================================
  // FALLBACK
  // ========================================
  if (topics.length === 0) {
    topics.push(
      'safety_planning',
      'awareness',
      'crisis_intervention'
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

    const detectedAudiences = assessment.detected_audiences || ['general'];

    console.log('🔍 Fetching resources:', {
      risk_level: assessment.risk_level,
      topics,
      jurisdiction_priority: jurisdictionPriority,
      audiences: detectedAudiences, // ← NEW LOG
      flags: Object.entries(assessment.flags)
        .filter(([_, value]) => value)
        .map(([key]) => key),
    });

    // Check if resources are expired (> 12 months old)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Priority 1: Try to fetch with jurisdiction, topic, and risk_band
    let resources: Resource[] = [];

    for (const jurisdiction of jurisdictionPriority) {
      console.log(`🔍 Trying jurisdiction: ${jurisdiction} with audiences: ${detectedAudiences.join(', ')}`);
      const audienceFilter = [...detectedAudiences, 'general'];

      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .in('topic', topics)
        .eq('jurisdiction', jurisdiction)
        .in('audience', audienceFilter) // Filter by audience
        .eq('is_active', true)
        .in('risk_band', bandsAtOrBelow(assessment.risk_level)) // risk band at or below
        .gte('last_verified', twelveMonthsAgo.toISOString().split('T')[0]) // Not expired
        .eq('display_as_card', true) // Only displayable cards
        .limit(limit);

      if (error) {
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
        // ⭐ Shuffle trước khi phân loại
        const shuffledData = shuffleArray(data);

        const audienceSpecific = shuffledData.filter(r => detectedAudiences.includes(r.audience));
        const general = shuffledData.filter(r => r.audience === 'general');

        // Mix: prefer audience-specific, then general
        resources = [...audienceSpecific, ...general].slice(0, limit);

        console.log(`✅ Found ${resources.length} resources for ${jurisdiction}`, {
          audience_specific: audienceSpecific.length,
          general: general.length,
        });
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
          .in('audience', audienceFilter) // Filter by audience
          .eq('is_active', true)
          .gte('last_verified', twelveMonthsAgo.toISOString().split('T')[0])
          .eq('display_as_card', true)
          .limit(limit);

        if (error) {
          console.error(`Error fetching resources (no risk filter) for ${jurisdiction}:`, error);
          continue;
        }

        if (data && data.length > 0) {
          const audienceSpecific = data.filter(r => detectedAudiences.includes(r.audience));
          const general = data.filter(r => r.audience === 'general');
          resources = [...audienceSpecific, ...general].slice(0, limit);
          console.log(`✅ Found ${resources.length} resources (no risk filter) for ${jurisdiction}`);
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
      const audienceSpecific = (data || []).filter(r => detectedAudiences.includes(r.audience));
      const general = (data || []).filter(r => r.audience === 'general');
      resources = [...audienceSpecific, ...general].slice(0, limit);

      console.log(`✅ Found ${resources.length} UNICEF fallback resources`);
    }

    // Log final result
    console.log('📚 Resources fetched:', {
      count: resources.length,
      topics_requested: topics,
      audiences_detected: detectedAudiences,
      resources: resources.map(r => ({
        title: r.title,
        topic: r.topic,
        jurisdiction: r.jurisdiction,
        audience: r.audience, // ⭐ Log audience
        risk_band: r.risk_band,
      })),
    });

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