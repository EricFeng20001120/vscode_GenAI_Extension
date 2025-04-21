import * as vscode from 'vscode';
import { getLLMSuggestion } from '../utils/llmUtils';
import MarkdownIt from 'markdown-it';
import { getFileIcon, getFileType, getVSCodeIcon } from '../utils/webviewUtils';


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
			const fileData = await vscode.workspace.fs.readFile(file);
			// Convert Uint8Array to string
			const content = Buffer.from(fileData).toString('utf8');
			// Send content to LLM for summarization
			const summary = (await getLLMSuggestion(content, 'summary')) ?? 'No summary available.';
			summaries.push({ fileName: file.fsPath, summary });
		}

		const panel = vscode.window.createWebviewPanel(
			'codebaseSummary',
			'Codebase Summary',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: true,
				localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'resources', 'media')],
			},
		);

		const cssPath = vscode.Uri.joinPath(context.extensionUri, 'resources', 'media', 'styles.css');
		const cssUri = panel.webview.asWebviewUri(cssPath);
		const scriptPath = vscode.Uri.joinPath(context.extensionUri, 'resources', 'media', 'script.js');
		const scriptUri = panel.webview.asWebviewUri(scriptPath);

		const md = new MarkdownIt();

		let htmlContent = `
		<html>
			<head>
				<link href="${cssUri}" rel="stylesheet" />
				<meta name="viewport" content="width=device-width, initial-scale=1">
			</head>
			<body>
				<div class="header">
					<div>
						<h1 style="margin: 0; font-weight: 600;">Codebase Insights</h1>
						<div class="file-meta" style="margin-top: 8px;">
							<span class="badge">${summaries.length} files</span>
						</div>
					</div>
					<div class="search-container">
						<input type="text" class="search-input" placeholder="Search files..." onkeyup="handleSearch(event)">
						<span class="search-icon">${getVSCodeIcon('search')}</span>
					</div>
				</div>

				<div class="file-grid">
					${summaries.length > 0 ? summaries.map(({ fileName, summary }) => `
						<div class="file-card" data-expanded="false">
							<div class="file-header">
								${getFileIcon(fileName)}
								<h3 class="file-name">${fileName.split(/[\\\\/]/).pop()}</h3>
								<span class="file-meta">
									<span class="badge">${getFileType(fileName)}</span>
									<span class="toggle-icon">${getVSCodeIcon('chevron-right')}</span>
								</span>
							</div>
							<div class="summary-content">
								${md.render(summary)}
								<div style="margin-top: 16px; border-top: 1px solid var(--vscode-editorWidget-border); padding-top: 12px;">
									<span class="file-path">${fileName}</span>
								</div>
							</div>
						</div>
					`,).join('') : `
						<div class="empty-state">
							${getVSCodeIcon('warning')}
							<p>No summaries available for this codebase</p>
						</div>
					`}
				</div>
			<script src="${scriptUri}"></script>
			</body>
		</html>
		`;

		panel.webview.html = htmlContent;
	});

	context.subscriptions.push(disposable);
}
