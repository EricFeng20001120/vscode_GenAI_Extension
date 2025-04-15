import { llmConfig } from './llmConfig';

/**
 * Fetches a suggestion from the LLM based on the provided prompt and type.
 * @param prompt - The input prompt for the LLM.
 * @param type - The type of response expected: 'code' or 'summary'.
 * @returns The LLM's response as a string.
 */
export async function getLLMSuggestion(prompt: string, type: 'code' | 'summary'): Promise<string | undefined> {
    const systemPrompt = llmConfig.systemPrompts[type];
  
    try {
      const response = await fetch(llmConfig.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: llmConfig.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          stream: false,
        }),
      });
  
      const data = await response.json();
      return data.message?.content;
    } catch (error) {
      console.error('Error fetching LLM suggestion:', error);
      return undefined;
    }
  }