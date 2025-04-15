import * as vscode from 'vscode';

/**
 * Registers the 'vscodellm.applySuggestedChanges' command.
 * This command applies suggested changes stored in the workspace state to the active editor.
 * @param context - The extension context.
 */
export function registerApplySuggestedChangesCommand(context: vscode.ExtensionContext) {
    // Register the command to apply suggested changes
    const applyChangesCommand = vscode.commands.registerCommand('vscodellm.applySuggestedChanges', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }
        
        const suggestedChanges = context.workspaceState.get<string>('vscodellm.suggestedChanges');
        if (!suggestedChanges) {
            vscode.window.showErrorMessage('No suggested changes available.');
            return;
        }
        const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)```/;
        const match = suggestedChanges.match(codeBlockRegex);
        const cleanedCode = match ? match[1].trim() : suggestedChanges.trim();
        
        const document = editor.document;
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
        );
        
        await editor.edit(editBuilder => {
            editBuilder.replace(fullRange, cleanedCode);
        });
        
        vscode.window.showInformationMessage('Suggested changes applied.');
    });

}