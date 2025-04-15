import * as vscode from 'vscode';
import { getLLMSuggestion } from '../utils/llmUtils';

/**
 * Registers the 'vscodellm.summarizeCodebase' command.
 * This command summarizes the codebase using an LLM and displays the summary in a webview panel.
 * @param context - The extension context.
 */
export function registerSummarizeCodebaseCommand(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('vscodellm.summarizeCodebase', async () => {
            
        vscode.window.showInformationMessage('Summarizing codebase...');
        const files = await vscode.workspace.findFiles('**/*.{js,ts,md,py}', '**/node_modules/**');
        const summaries: { fileName: string; summary: string }[] = [];

        for (const file of files) {
            const document = await vscode.workspace.openTextDocument(file);
            const content = document.getText();
            // Send content to LLM for summarization
            const summary = await getLLMSuggestion(content, 'summary')?? 'No summary available.';
            summaries.push({ fileName: file.fsPath, summary });
        }

        const panel = vscode.window.createWebviewPanel(
            'codebaseSummary',
            'Codebase Summary',
            vscode.ViewColumn.One,
        );
    
        let htmlContent = `<html><body><h1>Codebase Summary</h1>`;
        for (const { fileName, summary } of summaries) {
        htmlContent += `<h2>${fileName}</h2><pre>${summary}</pre>`;
        }
        htmlContent += `</body></html>`;
    
        panel.webview.html = htmlContent;

    });

    context.subscriptions.push(disposable);

}