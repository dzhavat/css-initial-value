import * as vscode from 'vscode';
import * as data from './properties.json';

interface Property {
	syntax: string;
	media: string | string[];
	inherited: boolean;
	animationType: string | string[];
	percentages: string | string[];
	groups: string[];
	initial: string | string[];
	appliesto: string;
	computed: string | string[];
	order: string;
	status: string;
	mdn_url?: string;
}

const properties: { [key: string]: Property } = data;

export function activate(context: vscode.ExtensionContext) {
	const hoverProvider: vscode.HoverProvider = {
		provideHover(doc, pos, token): vscode.ProviderResult<vscode.Hover> {
			const range = doc.getWordRangeAtPosition(pos, /[a-z\-]+:/ig);

			if (range === undefined) {
				return;
			}

			const initialValue = getInitialValue(doc.getText(range));

			if (initialValue === undefined) {
				return;
			}

			return new vscode.Hover(getText(initialValue));
		}
	};

	let disposable = vscode.languages.registerHoverProvider(
		[
			{ scheme: 'file', language: 'css' },
			{ scheme: 'file', language: 'scss' },
			{ scheme: 'file', language: 'sass' }
		],
		hoverProvider
	);

	context.subscriptions.push(disposable);
}

function getInitialValue(word: string): string | string[] {
	return properties[word.substring(0, word.length - 1)].initial;
}

function getText(initialValue: string | string[]): vscode.MarkdownString {
	let value = '';

	if (Array.isArray(initialValue)) {
		const props = initialValue.map(item => {
			return `* ${item}: \`${properties[item].initial}\``;
		});

		value = `
Initial value

As each of the properties:

${props.join('\n')}
		`;
	} else {
		value = `Initial value: \`${initialValue}\``;
	}

	return new vscode.MarkdownString(value);
}

export function deactivate() {}
