import * as vscode from 'vscode';
import { getLLMSuggestion } from '../utils/llmUtils';
import { getDatabaseContext } from '../utils/db';


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

/**
 * Registers the MySQL chat participant that processes user prompts,
 * generates SQL queries using the local LLM, and provides options to run them.
 * @param context - The extension context.
 */
export function registerSqlChatParticipant(context: vscode.ExtensionContext) {
    const sqlhandler: vscode.ChatRequestHandler = async (
        request,
        chatContext,
        response,
        token
        ) => {
        const userPrompt = request.prompt;
        
        const schemaContext = await getDatabaseContext();
        
        const fullPrompt = `${schemaContext}\n\n${userPrompt}`;
        
        const llmResponse = await getLLMSuggestion(fullPrompt, 'sql');
        
        if (!llmResponse) {
            response.markdown('Could not get a response from the LLM.');
            return;
        }
        
        response.markdown(llmResponse);
        
        const sqlRegex = /```(?:sql)?\n([\s\S]*?)\n?```/g;
        const match = sqlRegex.exec(llmResponse);
        
        if (match && match[1]) {
            const query = match[1].trim();
        
            response.button({
            command: 'vscode-mysql-chat.runQuery',
            title: 'Run Query',
            arguments: [query],
            });
        } else {
            response.markdown('Could not find a SQL query wrapped in a markdown code block.');
        }
    };

    vscode.chat.createChatParticipant('vscode-mysql-chat', sqlhandler);
}