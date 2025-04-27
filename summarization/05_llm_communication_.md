# Chapter 5: LLM Communication

Hello again! In [Chapter 4: Command Handling](04_command_handling_.md), we saw how we can create specific actions (commands) like "Apply Suggested Changes" or "Run Query" that users can trigger directly. Many of these commands, as well as the features from earlier chapters like [Inline Code Completion](02_inline_code_completion_provider_.md) and [Chat Interaction](03_chat_interaction_participants_.md), need to get information or suggestions from an AI.

But how does our extension actually *talk* to that AI, which usually lives somewhere else on the internet (or maybe running locally on your machine)? That's the job of the **LLM Communication** module.

## What's the Big Idea? The Extension's Dedicated Messenger

Imagine you need to send a very important message to someone who speaks a different language and lives far away. You probably wouldn't handle all the details yourself – finding their address, translating the message perfectly, figuring out the postal service rules, waiting for their reply, and translating it back. Instead, you might hire a dedicated messenger service that knows exactly how to do all that. You just give them your message, tell them who it's for, and they handle the rest, bringing you back the reply.

The **LLM Communication** part of our extension is exactly like that messenger service. Its whole purpose is to **handle all the technical details of talking to the external Large Language Model (LLM)**.

Features like code completion or chat don't need to worry about:

*   Where the LLM service is located (its web address or API endpoint).
*   Exactly how to format the question (the API request structure).
*   How to send the request over the internet.
*   How to understand the raw response from the AI.

They just use a simple function provided by this communication module, give it the question (the "prompt"), and get back the AI's answer. This makes the code for our features much cleaner and easier to understand!

**Goal:** To create a simple, reusable way for any part of the extension to get suggestions or answers from the configured LLM, hiding all the messy communication details.

## Key Concepts

1.  **LLM (Large Language Model):** The powerful AI model (like Llama, GPT, Claude, etc.) that can understand text, write code, answer questions, summarize information, etc. This model often runs as a separate service.
2.  **API Endpoint:** The specific web address (URL) where the LLM service is listening for requests. Think of it as the LLM's mailing address. (`http://localhost:11434/api/chat` in our default config).
3.  **API Request:** The structured message our extension sends *to* the LLM endpoint. It typically includes:
    *   The user's question or the code context (the **prompt**).
    *   Instructions for the AI (a **system prompt**, like "You are a helpful coding assistant").
    *   Which specific AI model to use (e.g., `llama3.1`).
    *   Other settings (like whether to stream the response).
4.  **API Response:** The message the LLM service sends *back* to our extension, containing the AI-generated text.
5.  **Abstraction (`getLLMSuggestion` function):** A helper function inside our extension (`src/utils/llmUtils.ts`) that acts as the simple interface to the communication layer. Other parts of the extension call *this* function instead of dealing with the API directly.
6.  **Configuration (`llmConfig`):** A file or object (`src/utils/llmConfig.ts`) where we store the settings needed for communication, like the API endpoint, the model name, and different system prompts tailored for various tasks (coding, summarizing, SQL, etc.). This makes it easy to change the LLM we're talking to without rewriting other code.

## How It Works: From Request to Response

Let's trace the journey of a request, for example, when the inline completion provider needs a suggestion:

1.  **Need Arises:** The Inline Completion Provider ([Chapter 2](02_inline_code_completion_provider_.md)) has the user's current line of code (`linePrefix`) and needs the AI to predict what comes next.
2.  **Call the Messenger:** It calls our helper function: `getLLMSuggestion(linePrefix, 'code')`. It passes the user's code and specifies the *type* of help needed ('code').
3.  **Consult the Settings:** Inside `getLLMSuggestion`, the code first looks at the configuration (`llmConfig`) to find:
    *   The LLM's address (`llmConfig.endpoint`).
    *   The specific model to use (`llmConfig.model`).
    *   The right set of instructions for a code request (`llmConfig.systemPrompts.code`).
4.  **Prepare the Package:** It formats the request message according to what the LLM API expects. This usually involves creating a JSON object containing the system prompt, the user's `linePrefix` (as the user prompt), and the model name.
5.  **Send the Message:** It uses a standard web function (like `fetch`) to send this JSON package over the internet to the LLM's API endpoint using the `POST` method.
6.  **Wait for Reply:** The function pauses (`await`) and waits for the LLM service to process the request and send back a response.
7.  **Unpack the Reply:** When the response arrives (usually also in JSON format), the function extracts the actual text generated by the AI (often nested inside the response object, like `data.message.content`).
8.  **Deliver the Result:** The function returns the extracted text (the code suggestion) back to the Inline Completion Provider.
9.  **Feature Uses Result:** The Inline Completion Provider takes the suggestion and shows it to the user in the editor.

This whole process (steps 3-8) is hidden inside the `getLLMSuggestion` function, making life much easier for the different features!

## Configuring the Connection (`src/utils/llmConfig.ts`)

Before we look at the messenger function itself, let's see where it gets its instructions. This configuration file makes it easy to switch LLMs or tweak how they behave.

```typescript
// src/utils/llmConfig.ts

// Define the structure of our configuration object
export interface LLMConfig {
	model: string; // Which AI model to use
	endpoint: string; // Where the AI service lives
	// Different instructions for different tasks
	systemPrompts: {
		code: string;
		summary: string;
		sql: string;
		rpgle: string;
	};
}

// The actual configuration values used by the extension
export const llmConfig: LLMConfig = {
	model: 'llama3.1', // Using the 'llama3.1' model
	// Talking to an Ollama server running locally by default
	endpoint: 'http://localhost:11434/api/chat',
	systemPrompts: {
		code: 'You are a professional coder. Respond only with code, without explanations or comments.',
		summary:
			'You are a professional software architect. Provide a high-level summary...',
		sql: 'You must return your suggested SQL query in a markdown code block...',
		rpgle: 'You are an expert in IBM i RPGLE programming...',
	},
};
```

**Explanation:**

1.  **`interface LLMConfig`:** This defines the *shape* or blueprint for our configuration. It tells TypeScript what properties to expect (`model`, `endpoint`, `systemPrompts`).
2.  **`systemPrompts`:** This nested object holds different "personalities" or instructions we give the AI depending on the task. For `'code'` requests, we tell it to act like a coder and just give code. For `'summary'`, we ask for a high-level overview.
3.  **`export const llmConfig`:** This is the actual configuration object the extension uses. You can see the default values set here (using `llama3.1` model via a local Ollama endpoint). If you wanted to use a different model or a cloud-based API, you would primarily change the values *here*.

## The Messenger Function (`src/utils/llmUtils.ts`)

Now, let's look at the `getLLMSuggestion` function itself. This is the workhorse that handles the communication.

```typescript
// src/utils/llmUtils.ts
import { llmConfig } from './llmConfig'; // Import the configuration

/**
 * Fetches a suggestion from the LLM based on the provided prompt and type.
 */
export async function getLLMSuggestion(
	prompt: string, // The user's input (e.g., code line, chat message)
	type: 'code' | 'summary' | 'sql' | 'rpgle', // What kind of answer we want
): Promise<string | undefined> { // Promises to return text, or nothing if error

	// 1. Get the right system prompt from config based on 'type'
	const systemPrompt = llmConfig.systemPrompts[type];

	try {
		// 2. Send the request to the LLM endpoint (from config)
		const response = await fetch(llmConfig.endpoint, {
			method: 'POST', // Sending data
			headers: { 'Content-Type': 'application/json' }, // Data is JSON
			// 3. Construct the body (the message payload)
			body: JSON.stringify({
				model: llmConfig.model, // Use model from config
				messages: [ // The conversation history
					{ role: 'system', content: systemPrompt }, // AI's instructions
					{ role: 'user', content: prompt }, // User's actual input
				],
				stream: false, // We want the whole response at once
			}),
		});

		// 4. Parse the JSON response from the LLM
		const data = await response.json();
		// 5. Extract the AI's message content (handling potential errors)
		return data.message?.content;

	} catch (error) {
		// 6. If anything went wrong (network issue, etc.)
		console.error('Error fetching LLM suggestion:', error);
		return undefined; // Return nothing
	}
}
```

**Explanation:**

1.  **Imports & Function Signature:** Imports the `llmConfig` and defines `getLLMSuggestion` which takes the `prompt` and `type`, and returns a `Promise` (because network requests take time) that should resolve to a `string` (the AI's answer) or `undefined` if there's an error.
2.  **Get System Prompt:** It looks up the correct `systemPrompt` in `llmConfig` using the `type` argument (e.g., `llmConfig.systemPrompts['code']`).
3.  **`fetch` Call:** This is the standard browser/Node.js function for making web requests.
    *   `llmConfig.endpoint`: The URL to send the request to.
    *   `method: 'POST'`: We're sending data to the server.
    *   `headers`: Tells the server we're sending data in JSON format.
    *   `body: JSON.stringify({...})`: This is the core message content, converted into a JSON string. It includes:
        *   `model`: From `llmConfig`.
        *   `messages`: An array representing the conversation. Here, it's simple: the system's instructions and the user's single prompt. For more complex chat interactions, this array could contain previous turns of the conversation.
        *   `stream: false`: Tells the LLM to send the entire response back at once, rather than piece by piece. (Streaming is often used in chat interfaces for responsiveness, but this function is simpler).
4.  **`await response.json()`:** Waits for the response to arrive and parses its body, assuming it's JSON data.
5.  **`return data.message?.content`:** Extracts the actual text generated by the AI. The structure `data.message.content` is specific to the Ollama API format; other APIs might have slightly different structures. The `?.` is optional chaining, preventing an error if `message` doesn't exist.
6.  **`catch (error)`:** If the `fetch` fails (e.g., network error, LLM server down), it logs the error and returns `undefined`, so the calling feature knows the request didn't succeed.

## Visualizing the Flow

Here's a diagram showing how a feature uses this communication module:

```mermaid
sequenceDiagram
    participant Feature (e.g., Inline Completion)
    participant LLM Utils (getLLMSuggestion)
    participant LLM Config
    participant External LLM API

    Feature->>LLM Utils: getLLMSuggestion(prompt, 'code')
    activate LLM Utils
    LLM Utils->>LLM Config: Read endpoint, model, systemPrompt['code']
    LLM Utils->>LLM Utils: Format API Request (JSON body)
    LLM Utils->>External LLM API: fetch(endpoint, {method: POST, body: ...})
    activate External LLM API
    External LLM API-->>LLM Utils: Send back API Response (JSON)
    deactivate External LLM API
    LLM Utils->>LLM Utils: Parse JSON, extract text (data.message.content)
    LLM Utils-->>Feature: Return suggestion text
    deactivate LLM Utils
```

## Conclusion: Simplifying the AI Conversation

The LLM Communication module is a crucial piece of plumbing in `vscodellm`. By acting as a dedicated messenger (`getLLMSuggestion`) that knows how to use the configuration (`llmConfig`) and talk the LLM's language (API requests/responses), it shields the rest of the extension from the complexities of external communication.

This abstraction allows features like code completion, chat, and commands to simply ask for AI help with a single function call, making the overall codebase cleaner, more maintainable, and easier to adapt to different LLM backends in the future.

Now that we understand how the extension gets information *from* the LLM, let's look at a feature that uses this heavily: summarizing the entire codebase and presenting it in a custom user interface.

**Next Chapter:** [Chapter 6: Codebase Summarization & Webview UI](06_codebase_summarization___webview_ui.md)

---

Generated by [AI Codebase Knowledge Builder]