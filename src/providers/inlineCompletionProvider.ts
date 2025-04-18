import * as vscode from 'vscode';
import { getLLMSuggestion } from '../utils/llmUtils';

/**
 * Registers an inline completion provider for JavaScript and Python files.
 * This provider uses an LLM to generate code suggestions based on the current line prefix.
 * @param context - The extension context.
 */
export function registerInlineCompletionProvider(context: vscode.ExtensionContext) {
	const provider = vscode.languages.registerInlineCompletionItemProvider(
		[
			{ language: 'javascript', scheme: 'file' },
			{ language: 'python', scheme: 'file' },
		],
		{
			async provideInlineCompletionItems(document, position, context, token) {
				const line = document.lineAt(position);
				const linePrefix = document.lineAt(position).text.substring(0, position.character);
				//console.log('Current line prefix:', linePrefix);
				const suggestion = await getLLMSuggestion(linePrefix, 'code');
				//console.log('LLM suggestion:', suggestion);

				if (!suggestion) {
					return [];
				}

				// Remove the already typed prefix from the suggestion
				const trimmedSuggestion = suggestion.startsWith(linePrefix)
					? suggestion.slice(linePrefix.length)
					: suggestion;

				// Define the range from the current position to the end of the line
				const range = new vscode.Range(position, line.range.end);

				return [
					{
						insertText: trimmedSuggestion,
						range: range,
					},
				];
			},
		},
	);

	context.subscriptions.push(provider);
}
