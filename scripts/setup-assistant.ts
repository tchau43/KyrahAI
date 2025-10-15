// scripts/setup-assistant.ts
// Script to setup OpenAI Assistant with system instructions from database
// Run: npx tsx scripts/setup-assistant.ts

import { setupAssistant } from '../src/lib/setup-assistant';

async function main() {
  console.log('🚀 Starting assistant setup...\n');

  try {
    const assistantId = await setupAssistant({
      name: 'Kyrah AI Assistant',
      model: 'gpt-4o-mini',
    });

    console.log('\n✅ Assistant setup completed!');
    console.log(`📋 Assistant ID: ${assistantId}\n`);

    if (!process.env.ASSISTANT_ID) {
      console.log('⚠️  IMPORTANT: Add this to your .env.local file:');
      console.log(`ASSISTANT_ID=${assistantId}\n`);
    }

    console.log('✨ You can now use the Assistant API for your chatbot!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting up assistant:');
    console.error(error);
    process.exit(1);
  }
}

main();

