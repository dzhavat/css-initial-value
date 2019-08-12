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

			if (!range) {
				return;
			}

			let word = doc.getText(range);
			const value = properties[word.substring(0, word.length - 1)].initial;

			if (value === undefined) {
				return;
			}

			const text = new vscode.MarkdownString(`Initial value: \`${value}\``);

			return new vscode.Hover(text);
		}
	};

	let disposable = vscode.languages.registerHoverProvider(
		{ scheme: 'file', language: 'css' },
		hoverProvider
	);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
