import { llmConfig } from './llmConfig';
import ollama from 'ollama';

/**
 * Fetches a suggestion from the LLM based on the provided prompt and type.
 * @param prompt - The input prompt for the LLM.
 * @param type - The type of response expected: 'code' or 'summary'.
 * @returns The LLM's response as a string.
 */
export async function getLLMSuggestion(
	prompt: string,
	type: 'code' | 'summary',
): Promise<string | undefined> {
	const systemPrompt = llmConfig.systemPrompts[type];

	try {
		const response = await ollama.chat({
			model: llmConfig.model,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: prompt },
			],
		});

		return response.message?.content;
	} catch (error) {
		console.error('Error fetching LLM suggestion:', error);
		return undefined;
	}
}

export async function streamLLMSuggestion(
	prompt: string,
	type: 'code' | 'sql' | 'rpgle',
	onToken: (token: string) => void,
): Promise<string> {
	const systemPrompt = llmConfig.systemPrompts[type];
	let fullResponse = '';

	try {
		const stream = await ollama.chat({
			model: llmConfig.model,
			messages: [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: prompt },
			],
			stream: true,
		});

		for await (const chunk of stream) {
			const token = chunk.message?.content ?? '';
			fullResponse += token;
			onToken(token);
		}

		return fullResponse;
	} catch (error) {
		console.error('Error streaming LLM suggestion:', error);
		return '';
	}
}
