// src/services/risk-assessment.service.ts
import openai from '@/lib/openai';
import { RiskAssessmentOutput, RiskAssessmentResponse } from '@/types/risk-assessment';
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
 * JSON Schema for structured output
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
    },
    required: [
      'flags',
      'risk_level',
      'confidence',
      'indicators',
      'analysis_notes',
      'recommended_resource_topics',
      'requires_immediate_cards',
    ],
    additionalProperties: false,
  },
};

/**
 * Main function to assess risk from user message
 */
export async function assessRisk(userMessage: string): Promise<RiskAssessmentResponse> {
  try {
    // Get Assistant ID từ environment (đã setup trên OpenAI Platform)
    const assistantId = getRiskAssessmentAssistantId();

    // Create a thread
    const thread = await openai.beta.threads.create();

    // Prepare the analysis prompt with indicator database
    const analysisPrompt = `# Indicator Database
${JSON.stringify(indicatorsData, null, 2)}

# User Message to Analyze
${userMessage}

# Instructions
Analyze the user message above for risk indicators. Match phrases from the message against the indicator database and return a structured risk assessment following the JSON schema.`;

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
    const lastAssistant = messages.data.find((m) => m.role === 'assistant');
    if (!lastAssistant || !Array.isArray(lastAssistant.content) || lastAssistant.content.length === 0) {
      throw new Error('No assistant message found');
    }
    const textPart = lastAssistant.content.find((c) => c.type === 'text');
    if (!textPart || textPart.type !== 'text') {
      throw new Error('Assistant response missing text content');
    }
    let assessmentOutput: RiskAssessmentOutput;
    try {
      assessmentOutput = JSON.parse(textPart.text.value);
    } catch {
      throw new Error('Failed to parse assessment JSON');
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
 * Validate risk assessment output
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
}

/**
 * Fallback assessment for when the AI fails
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