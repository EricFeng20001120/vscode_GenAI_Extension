# VSCode LLM Assistant

A Visual Studio Code extension that leverages a local Large Language Model (LLM) to enhance your coding experience with:

- **Codebase Summarization**
- **Inline Code Suggestions**
- **Chat-Based Code Assistance**

---

## Features

### Codebase Summarization

Analyze your entire project to receive high-level architectural summaries

-Scans `.js`, `.ts`, and `.md` files (excluding `node_modules`)
-Utilizes a local LLM to generate concise summaries
-Displays results in a dedicated webview panel within VS Code

### Inline Code Suggestions

Receive real-time code completions as you type.

Supports JavaScript and Python file.
Provides context-aware suggestions powered by your local LLM.

## Chat-Based Code Assistance

Engage in a chat with the LLM for code-related queris.

- Initiate a chat session within VS Coe.- Ask questions or request code snippes.- Apply suggested changes directly to your codebase.

---

# Installation

- Ensure you have a local LLM server running (e.g., LLaMA 3.1) accessible at `http://localhost:11434/api/chat`.
- Clone this repository or download the extension package.
- Open the project in VS Code.
- Run `npm install` to install dependenceis.
- Press `F5` to launch the extension in a new Extension Development Host window.

---

# Usage

## Summarize Codebase

- Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P).
- Type and select `Summarize Codebase`.
- View the generated summaries in the webview panel.

## Inline Code Suggestions

As you type in JavaScript or Python files, inline suggestions will appear automatically.

## Chat-Based Assistance

- Open the Chat view in VS Code.
- Start a new chat session with the LLM.
- Ask questions or request code snippets.
- Click on "Approve Changes" to apply suggestions directly to your code.

---

# Configuration

You can customize the LLM settings by modifying the `llmConfig.ts` file:

```typescript
export const llmConfig = {
	model: 'llama3.1',
	endpoint: 'http://localhost:11434/api/chat',
	systemPrompts: {
		code: 'You are a professional coder. Respond only with code, without explanations or comments.',
		summary:
			'You are a professional software architect. Provide a high-level summary of the codebase, focusing on architecture, design patterns, and module responsibilities. Avoid code snippets. Do not make up anything that is not in the code.',
	},
};
```

Adjust the `model` and `endpoint` fields as needed to match your local LLM setup.

# License

This project is licensed under the [MIT License](LICENS).

--

_Note: Ensure that your local LLM server is operational and accessible at the specified endpoint before using the extension's feature._

--
