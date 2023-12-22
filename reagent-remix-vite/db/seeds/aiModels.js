import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const openAiProvider = await prisma.modelProvider.upsert({
    where: {
      name: 'openai',
    },
    update: {},
    create: {
      name: 'openai',
      credentialsSchema:
        '{"apiKey": {"type": "string", "name": {"en_US": "API Key"}}}',
    },
  });

  const gpt41106PreviewEditorSchema = `{
    "schemaVersion": 1,
    "allInputs": {
      "system-prompt": {
        "name": {
          "en_US": "System prompt"
        },
        "description": {
          "en_US": "You can use the system prompt to give general instructions to the model independent of the specific chat prompt. For example, the system prompt is often used to ask the model to respond politely and factually. Some models pay little attention to the system prompt and should be instructed primarily in the chat prompt."
        },
        "type": "plain-text-with-parameters"
      },
      "chat-prompt": {
        "name": {
          "en_US": "Chat prompt"
        },
        "description": {
          "en_US": "The chat prompt is the main input to the model. It can contain instructions, information, and relevant prior context.\\n\\nTypically, the last item in a prompt is a &ldquo;User&rdquo; section, representing the current query. The model will always respond with an &ldquo;Assistant&rdquo; section.\\n\\nEven if you are not building a chatbot, you can use the chat format to delineate &rdquo;turns&ldquo; taken by the system. &ldquo;User&rdquo; sections do not need to be formatted as natural-language questions.\\n\\nMany of the highest-quality large language models are available only in chat format, so it can be valuable to use chat prompts even if your prompt only ever consists of a single &ldquo;User&rdquo; turn."
        },
        "type": "chat-text-with-parameters",
        "editorHeight": "primary"
      },
      "temperature": {
        "name": {
          "en_US": "Temperature"
        },
        "description": {
          "en_US": ""
        },
        "type": "number",
        "default": 1,
        "min": 0,
        "max": 2
      },
      "maximum-completion-length": {
        "name": {
          "en_US": "Maximum response length"
        },
        "description": {
          "en_US": ""
        },
        "type": "integer",
        "default": 512,
        "min": 1,
        "max": 4095
      },
      "_todo": [
        "stop-sequences",
        "top-p",
        "frequency-penalty",
        "presence-penalty"
      ]
    },
  
    "modelInputComponents": [
      "system-prompt",
      "chat-prompt"
    ],
  
    "modelParameterComponents": [
      "temperature",
      "maximum-completion-length"
    ]
  }`;

  const gpt41106Preview = await prisma.aIModel.upsert({
    where: {
      modelProviderId_name_revision: {
        modelProviderId: openAiProvider.id,
        name: 'gpt-4-1106-preview',
        revision: '2023-12-22',
      },
    },
    update: {
      editorSchema: gpt41106PreviewEditorSchema,
    },
    create: {
      modelProviderId: openAiProvider.id,
      name: 'gpt-4-1106-preview',
      revision: '2023-12-22',
      editorSchema: gpt41106PreviewEditorSchema,
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
