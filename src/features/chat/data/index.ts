export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

export const dummyConversations: Conversation[] = [
  {
    id: '1',
    title: 'Understanding Healthy Communication',
    updatedAt: new Date('2025-01-15T10:30:00'),
    messages: [
      {
        id: '1-1',
        role: 'user',
        content: 'Can you help me understand if this message from my partner seems healthy?',
        timestamp: new Date('2025-01-15T10:30:00'),
      },
      {
        id: '1-2',
        role: 'assistant',
        content: "I'd be happy to help you analyze communication patterns. Please share the message you'd like me to review, and I'll provide insights on potential emotional dynamics.",
        timestamp: new Date('2025-01-15T10:30:15'),
      },
      {
        id: '1-3',
        role: 'user',
        content: 'They said: "You never listen to me. You always make everything about yourself."',
        timestamp: new Date('2025-01-15T10:31:00'),
      },
      {
        id: '1-4',
        role: 'assistant',
        content: 'This message contains some communication patterns worth noting:\n\n1. **Absolute Language**: Words like "never" and "always" are absolutes that can feel accusatory and may not accurately reflect reality.\n\n2. **Generalization**: These statements generalize behavior rather than addressing specific instances.\n\n3. **Potential Concerns**: While this could be expressing genuine frustration, the use of absolutes might indicate:\n   - Built-up resentment\n   - Difficulty expressing needs constructively\n   - Possible need for better communication strategies\n\nHealthier alternatives might include:\n- "I felt unheard when [specific situation]"\n- "I\'d appreciate if we could focus on [specific issue]"\n\nRemember, context matters. Is this part of a pattern, or an isolated incident during stress?',
        timestamp: new Date('2025-01-15T10:31:30'),
      },
    ],
  },
  {
    id: '2',
    title: 'Recognizing Manipulation Tactics',
    updatedAt: new Date('2025-01-14T15:20:00'),
    messages: [
      {
        id: '2-1',
        role: 'user',
        content: 'What are some signs of gaslighting?',
        timestamp: new Date('2025-01-14T15:20:00'),
      },
      {
        id: '2-2',
        role: 'assistant',
        content: 'Gaslighting is a form of psychological manipulation. Here are key signs:\n\n**Common Tactics:**\n1. Denying things they said or did\n2. Trivializing your feelings ("You\'re too sensitive")\n3. Countering your memory of events\n4. Withholding information or empathy\n5. Making you question your reality\n\n**Effects on You:**\n- Second-guessing yourself constantly\n- Apologizing frequently\n- Making excuses for their behavior\n- Feeling confused or "crazy"\n- Difficulty making decisions\n\n**Important Notes:**\n- Not all disagreements are gaslighting\n- Pattern matters more than isolated incidents\n- Professional help is available\n\nIf you\'re experiencing this, please reach out to support resources. Would you like to discuss a specific situation?',
        timestamp: new Date('2025-01-14T15:20:45'),
      },
    ],
  },
  {
    id: '3',
    title: 'Setting Healthy Boundaries',
    updatedAt: new Date('2025-01-13T09:15:00'),
    messages: [
      {
        id: '3-1',
        role: 'user',
        content: 'How do I set boundaries without feeling guilty?',
        timestamp: new Date('2025-01-13T09:15:00'),
      },
      {
        id: '3-2',
        role: 'assistant',
        content: 'Setting boundaries is an act of self-care and healthy relationships. Here are some strategies:\n\n**Why Guilt Happens:**\n- Learned patterns of people-pleasing\n- Fear of conflict or rejection\n- Misunderstanding that boundaries are selfish\n\n**Healthy Boundary Setting:**\n1. **Be Clear**: "I need [X]" or "I\'m not comfortable with [Y]"\n2. **Be Consistent**: Follow through with consequences\n3. **Start Small**: Practice with low-stakes situations\n4. **Remember**: Your needs are valid\n\n**Example Boundaries:**\n- "I need some alone time to recharge"\n- "I\'m not available to text after 10 PM"\n- "I prefer we discuss this calmly"\n\n**Dealing with Guilt:**\n- Recognize guilt doesn\'t mean you\'re wrong\n- Boundaries protect both people in relationships\n- Seek support from trusted friends or therapists\n\nWhat specific boundary are you trying to set?',
        timestamp: new Date('2025-01-13T09:15:45'),
      },
    ],
  },
];
