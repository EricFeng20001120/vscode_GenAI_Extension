export interface LLMConfig {
    model: string;
    endpoint: string;
    systemPrompts: {
      code: string;
      summary: string;
      sql: string;
      rpgle: string;
    };
  }
  
  export const llmConfig: LLMConfig = {
    model: 'llama3.1',
    endpoint: 'http://localhost:11434/api/chat',
    systemPrompts: {
      code: 'You are a professional coder. Respond only with code, without explanations or comments.',
      summary: 'You are a professional software architect. Provide a high-level summary of the codebase, focusing on architecture, design patterns, and module responsibilities. Avoid code snippets. Do not make up anything that is not in the code.',
      sql: 'You must return your suggested SQL query in a markdown code block that begins with \`\`\`sql and ends with \`\`\`.',
      rpgle: 'You are an expert in IBM i RPGLE programming. Analyze the provided RPGLE code and explain its functionality, including details about procedures, data structures, file operations, and business logic. Provide insights into how the code interacts with the IBM i system and any external resources. Avoid making assumptions beyond the given code.'
    },
  };
  