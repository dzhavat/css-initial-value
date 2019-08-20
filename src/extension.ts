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
			const templateLanguages: string [] = ['vue', 'svelte'];
			
			if (templateLanguages.indexOf(doc.languageId) !== -1) {
				const styleRegex = /<\s*style[^>]*>([\s\S]*?)<\s*\/\s*style>/g,
						match = styleRegex.exec(doc.getText());
	
				if (match) {
					const styleStartPos = doc.positionAt(match.index),
						  styleEndPos = doc.positionAt(match.index + match[0].length),
						  shouldShowInitialValue = (pos.line > styleStartPos.line && pos.line < styleEndPos.line);
					
					if (!shouldShowInitialValue) {
						return;
					}
				}
			}

			const range = doc.getWordRangeAtPosition(pos, /[a-z\-]+\s*:/ig);

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
		['css', 'less', 'sass', 'scss', 'vue', 'svelte'],
		hoverProvider
	);

	context.subscriptions.push(disposable);
}

function getInitialValue(word: string): string | string[] {
	return properties[word.slice(0, -1).trim()].initial;
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
