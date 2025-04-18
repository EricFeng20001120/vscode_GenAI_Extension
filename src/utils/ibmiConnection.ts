import { CodeForIBMi } from '@halcyontech/vscode-ibmi-types';
import Instance from '@halcyontech/vscode-ibmi-types/Instance';
import { Extension, extensions } from 'vscode';

let baseExtension: Extension<CodeForIBMi> | undefined;

/**
 * This should be used on your extension activation.
 */
export function loadBase(): CodeForIBMi | undefined {
	if (!baseExtension) {
		baseExtension = extensions
			? extensions.getExtension(`halcyontechltd.code-for-ibmi`)
			: undefined;
	}

	return baseExtension && baseExtension.isActive && baseExtension.exports
		? baseExtension.exports
		: undefined;
}

/**
 * Used when you want to fetch the extension 'instance' (the connection)
 */
export function getInstance(): Instance | undefined {
	return baseExtension && baseExtension.isActive && baseExtension.exports
		? baseExtension.exports.instance
		: undefined;
}
