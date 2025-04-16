import * as vscode from 'vscode';
import { getLLMSuggestion } from '../utils/llmUtils';

/**
 * Apply the MySQL query once user pressed "run query" from the generated query.
 * @param context - The extension context.
 */
export function registerRunQueryCommand(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('vscode-sql-chat.runQuery', async (query: string) => {
        try {
                const document = await vscode.workspace.openTextDocument({ language: 'sql', content: query });
                const editor = await vscode.window.showTextDocument(document);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to run query in editor: ${(error as Error).message}`);
            }
    });
}