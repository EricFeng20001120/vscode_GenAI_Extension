// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { registerApplySuggestedChangesCommand } from './commands/applySuggestedChanges';
import { registerSummarizeCodebaseCommand } from './commands/summarizeCodebase';
import { registerInlineCompletionProvider } from './providers/inlineCompletionProvider';
import {
	registerChatParticipant,
	registerSqlChatParticipant,
	registerRPGLEChatParticipant,
} from './participants/chatParticipant';
import { registerRunQueryCommand } from './commands/runQuery';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscodellm" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	registerRPGLEChatParticipant(context);

	// sql llm chatbot
	registerSqlChatParticipant(context);

	//apply query to a sql file
	registerRunQueryCommand(context);

	//Summarize codebase
	registerSummarizeCodebaseCommand(context);

	// Register the command to apply suggested changes
	registerApplySuggestedChangesCommand(context);

	// Register the chat participant
	registerChatParticipant(context);

	// code autocomplete
	registerInlineCompletionProvider(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
