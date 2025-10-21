// src/services/risk-assessment.service.ts
import openai from '@/lib/openai';
import {
  RiskAssessmentOutput,
  RiskAssessmentResponse,
  AUDIENCES,
  normalizeAudiences,
} from '@/types/risk-assessment';
import indicatorsData from '@/data/indicators.json';

/**
 * Get Risk Assessment Assistant ID from environment
 */
function getRiskAssessmentAssistantId(): string {
  const assistantId = process.env.RISK_ASSESSMENT_ASSISTANT_ID;
  if (!assistantId) {
    throw new Error('RISK_ASSESSMENT_ASSISTANT_ID environment variable is not set');
  }
  return assistantId;
}

/**
 * JSON Schema for structured output (WITH AUDIENCE DETECTION)
 * ⭐ FIXED: Uses centralized AUDIENCES constant
 */
const RISK_ASSESSMENT_SCHEMA = {
  name: 'risk_assessment_output',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      flags: {
        type: 'object',
        properties: {
          legal: { type: 'boolean' },
          sexual: { type: 'boolean' },
          digital: { type: 'boolean' },
          physical: { type: 'boolean' },
          emotional: { type: 'boolean' },
          financial: { type: 'boolean' },
          self_harm: { type: 'boolean' },
          gaslighting: { type: 'boolean' },
          imminent_danger: { type: 'boolean' },
        },
        required: [
          'legal',
          'sexual',
          'digital',
          'physical',
          'emotional',
          'financial',
          'self_harm',
          'gaslighting',
          'imminent_danger',
        ],
        additionalProperties: false,
      },
      risk_level: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
      },
      confidence: {
        type: 'number',
        minimum: 0,
        maximum: 1,
      },
      indicators: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            indicator_id: { type: 'string' },
            matched_phrases: {
              type: 'array',
              items: { type: 'string' },
            },
            flag_category: { type: 'string' },
            severity: { type: 'string', enum: ['low', 'medium', 'high'] },
          },
          required: ['indicator_id', 'matched_phrases', 'flag_category', 'severity'],
          additionalProperties: false,
        },
      },
      analysis_notes: { type: 'string' },
      recommended_resource_topics: {
        type: 'array',
        items: { type: 'string' },
      },
      requires_immediate_cards: { type: 'boolean' },
      detected_audiences: {
        type: 'array',
        items: {
          type: 'string',
          enum: AUDIENCES as unknown as string[],
        },
        minItems: 1,
      },
    },
    required: [
      'flags',
      'risk_level',
      'confidence',
      'indicators',
      'analysis_notes',
      'recommended_resource_topics',
      'requires_immediate_cards',
      'detected_audiences',
    ],
    additionalProperties: false,
  },
};

/**
 * Main function to assess risk from user message
 */
export async function assessRisk(userMessage: string): Promise<RiskAssessmentResponse> {
  try {
    // Get Assistant ID
    const assistantId = getRiskAssessmentAssistantId();

    // Create a thread
    const thread = await openai.beta.threads.create();

    // Prepare the analysis prompt with indicator database
    const analysisPrompt = `# Indicator Database
${JSON.stringify(indicatorsData, null, 2)}

# User Message to Analyze
${userMessage}

# Instructions
Analyze the user message above for risk indicators AND detect vulnerable audience groups.

CRITICAL: You MUST detect audience tags from the message:
- Look for explicit mentions: "I am gay", "tôi là gay", "I'm 16", "em 15 tuổi"
- Contextual clues: "my husband" → women, "my kids" → parents
- Default to ["general"] if no specific audience detected

Return a structured risk assessment following the JSON schema.`;

    // Add message to thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: analysisPrompt,
    });

    // Run the assistant with structured output
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      response_format: {
        type: 'json_schema',
        json_schema: RISK_ASSESSMENT_SCHEMA,
      },
    });

    // Wait for completion
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    // Poll until completed (with timeout)
    const maxAttempts = 30; // 30 seconds timeout
    let attempts = 0;

    while (runStatus.status !== 'completed' && attempts < maxAttempts) {
      if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
        throw new Error(`Risk assessment run ${runStatus.status}: ${runStatus.last_error?.message}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Risk assessment timed out');
    }

    // Get messages
    const messages = await openai.beta.threads.messages.list(thread.id, { order: 'desc', limit: 10 });
    // Prefer the message from the current run, fallback to any assistant message
    const lastAssistant = messages.data.find((m) => m.role === 'assistant' && m.run_id === run.id)
      ?? messages.data.find((m) => m.role === 'assistant');

    if (!lastAssistant || !Array.isArray(lastAssistant.content) || lastAssistant.content.length === 0) {
      throw new Error('No assistant message found');
    }

    let assessmentOutput: RiskAssessmentOutput;

    try {
      // Extract text content (json_schema returns JSON as a string in text type)
      const textContent = lastAssistant.content.find(
        (c): c is Extract<typeof c, { type: 'text' }> => c.type === 'text'
      );

      if (!textContent) {
        throw new Error('Assistant response missing text content');
      }

      const jsonStr = textContent.text.value;

      if (!jsonStr || jsonStr.trim() === '') {
        throw new Error('Assistant response has empty text value');
      }

      assessmentOutput = JSON.parse(jsonStr);
    } catch (error) {
      throw new Error(
        `Failed to parse assessment: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    if (assessmentOutput.detected_audiences) {
      assessmentOutput.detected_audiences = normalizeAudiences(
        assessmentOutput.detected_audiences as string[]
      );
    }

    // Validate the output
    validateRiskAssessment(assessmentOutput);

    return {
      success: true,
      data: assessmentOutput,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error in risk assessment',
      data: getFallbackAssessment(),
    };
  }
}

/**
 * Validate risk assessment output (WITH AUDIENCE CHECK)
 */
function validateRiskAssessment(data: any): void {
  const requiredFlags = [
    'legal',
    'sexual',
    'digital',
    'physical',
    'emotional',
    'financial',
    'self_harm',
    'gaslighting',
    'imminent_danger',
  ];

  // Check flags
  if (!data.flags || typeof data.flags !== 'object') {
    throw new Error('Invalid flags structure');
  }

  for (const flag of requiredFlags) {
    if (typeof data.flags[flag] !== 'boolean') {
      throw new Error(`flags.${flag} must be a boolean`);
    }
  }

  // Check risk_level
  if (!['low', 'medium', 'high'].includes(data.risk_level)) {
    throw new Error('Invalid risk_level');
  }

  // Check confidence
  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
    throw new Error('confidence must be between 0 and 1');
  }

  // Check indicators
  if (!Array.isArray(data.indicators)) {
    throw new Error('indicators must be an array');
  }

  if (!Array.isArray(data.detected_audiences) || data.detected_audiences.length === 0) {
    data.detected_audiences = ['general'];
  }

  // Validate all audiences are in the enum
  const invalidAudiences = data.detected_audiences.filter(
    (a: string) => !AUDIENCES.includes(a as any)
  );
  if (invalidAudiences.length > 0) {
    data.detected_audiences = data.detected_audiences.filter((a: string) =>
      AUDIENCES.includes(a as any)
    );
    if (data.detected_audiences.length === 0) {
      data.detected_audiences = ['general'];
    }
  }
}

/**
 * Fallback assessment for when the AI fails (WITH AUDIENCES)
 */
function getFallbackAssessment(): RiskAssessmentOutput {
  return {
    flags: {
      legal: false,
      sexual: false,
      digital: false,
      physical: false,
      emotional: false,
      financial: false,
      self_harm: false,
      gaslighting: false,
      imminent_danger: false,
    },
    risk_level: 'low',
    confidence: 0.5,
    indicators: [],
    analysis_notes: 'Fallback assessment due to system error',
    recommended_resource_topics: ['general_support'],
    requires_immediate_cards: false,
    detected_audiences: ['general'],
  };
}

/**
 * Quick check for crisis keywords (backup validation)
 */
export function containsCrisisKeywords(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  const crisisKeywords = [
    'tự tử',
    'muốn chết',
    'kết thúc cuộc đời',
    'suicide',
    'kill myself',
    'end my life',
    'want to die',
    'không muốn sống',
    'đâm',
    'dao',
    'súng',
    'knife',
    'gun',
    'weapon',
  ];

  return crisisKeywords.some((keyword) => lowerMessage.includes(keyword));
}