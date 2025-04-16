export interface LLMConfig {
    model: string;
    endpoint: string;
    systemPrompts: {
      code: string;
      summary: string;
      sql: string;
    };
  }
  
  export const llmConfig: LLMConfig = {
    model: 'llama3.1',
    endpoint: 'http://localhost:11434/api/chat',
    systemPrompts: {
      code: 'You are a professional coder. Respond only with code, without explanations or comments.',
      summary: 'You are a professional software architect. Provide a high-level summary of the codebase, focusing on architecture, design patterns, and module responsibilities. Avoid code snippets. Do not make up anything that is not in the code.',
      sql: 'You must return your suggested SQL query in a markdown code block that begins with \`\`\`sql and ends with \`\`\`.'
    },
  };
  