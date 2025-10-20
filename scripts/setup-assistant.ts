import 'dotenv/config';
import { setupAssistant, getAssistant } from '../src/lib/setup-assistant';

async function main() {
  console.log('🚀 Starting assistant setup...\n');

  try {
    const existingAssistantId = process.env.ASSISTANT_ID;

    if (existingAssistantId) {
      console.log(`📋 Found existing assistant ID: ${existingAssistantId}`);
      console.log('🔄 Updating assistant with latest instructions from database...\n');
    } else {
      console.log('📝 No existing assistant ID found');
      console.log('✨ Creating new assistant...\n');
    }

    const assistantId = await setupAssistant({
      name: 'Kyrah AI Assistant',
      model: 'gpt-4.1-nano',
      temperature: 0.7,
    });

    console.log('\n✅ Assistant setup completed!');
    console.log(`📋 Assistant ID: ${assistantId}\n`);

    // Verify assistant exists
    const assistant = await getAssistant(assistantId);
    console.log('✓ Assistant verified:');
    console.log(`  - Name: ${assistant.name}`);
    console.log(`  - Model: ${assistant.model}`);
    console.log(`  - Instructions length: ${assistant.instructions?.length || 0} characters\n`);

    if (!process.env.ASSISTANT_ID) {
      console.log('⚠️  IMPORTANT: Add this to your .env file:');
      console.log(`ASSISTANT_ID=${assistantId}\n`);
    }

    console.log('✨ Assistant is ready to use!');
    console.log('💡 Run this script again anytime to update the assistant with latest prompts from database.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting up assistant:');
    console.error(error);
    process.exit(1);
  }
}

main();

