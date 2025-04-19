export function getFileIcon(fileName: string): string {
	const ext = fileName.split('.').pop() || '';
	const iconMap: { [key: string]: string } = {
		js: 'file-code',
		ts: 'file-code',
		py: 'file-code',
		md: 'markdown',
	};
	return getVSCodeIcon(iconMap[ext] || 'file');
}

export function getFileType(fileName: string): string {
	return fileName.split('.').pop()?.toUpperCase() || 'FILE';
}

export function getVSCodeIcon(name: string): string {
	const iconMap: { [key: string]: string } = {
		search: '🔍',
		'chevron-right': '▶',
		warning: '⚠️',
		'file-code': '📄',
		file: '📁',
		markdown: '📝',
	};
	return iconMap[name];
}
