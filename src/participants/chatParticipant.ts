import * as vscode from 'vscode';
import { getLLMSuggestion } from '../utils/llmUtils';

/**
 * Registers a chat participant that processes user chat requests and generates responses.
 * @param context - The extension context.
 */
export function registerChatParticipant(context: vscode.ExtensionContext) {
    // Register the chat participant
    const handler: vscode.ChatRequestHandler = async (
        request: vscode.ChatRequest,
        chatContext: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ) => {
        
        const editor = vscode.window.activeTextEditor;
        let contextText = '';
        if (editor) {
            const document = editor.document;
            contextText = document.getText();
        }

        const combinedPrompt = `Context:\n${contextText}\n\nUser Query:\n${request.prompt}`;
        
        try {

            const llmResponse = await getLLMSuggestion(combinedPrompt, 'code') ?? 'No code available.';;
    
            // Store the suggested changes
            context.workspaceState.update('vscodellm.suggestedChanges', llmResponse);

            // Display the response with the "Approve Changes" button
            stream.markdown(llmResponse);
            // Add the "Approve Changes" button
            stream.button({
                command: 'vscodellm.applySuggestedChanges',
                title: 'Approve Changes'
            });
            } catch (error) {
                stream.markdown(`**Error:** ${error}`);
            }
        };
    
        const participant = vscode.chat.createChatParticipant('vscodellm.chat', handler);
        participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'resources', 'icon.png'); // Optional: set an icon

}