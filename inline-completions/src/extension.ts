import * as vscode from 'vscode';
import { Range } from 'vscode';
import axios from 'axios';

// 1. auto-compele (basic funcitonality)
// 2. summarize the funciton (documentation), class generation
// 3. optimization

export function activate(context: vscode.ExtensionContext) {
	console.log('inline-completions demo started');
	vscode.commands.registerCommand('demo-ext.command1', async (...args) => {
		console.log('command1 called with args:', args);
		vscode.window.showInformationMessage('command1: ' + JSON.stringify(args));
	});

	let lastSuggestion = '';
	let lastValidInput = '';
	let differenceCount = 0;

	const provider: vscode.InlineCompletionItemProvider = {
		async provideInlineCompletionItems(document, position, context, token) {
			console.log('provideInlineCompletionItems triggered');

			const prevLineText = document.lineAt(position.line - 1).text;
			if (!prevLineText.trim().startsWith('//')) {
				return;
			}

			// Get the current line's text, excluding leading spaces
			const currentLineText = document.lineAt(position.line).text;
			const trimmedCurrentLineText = currentLineText.trimStart();
			const leadingSpacesCount = currentLineText.length - trimmedCurrentLineText.length;

			if (trimmedCurrentLineText.length !== 0) {
				if (lastSuggestion.startsWith(trimmedCurrentLineText)) {
					lastValidInput = trimmedCurrentLineText;
					differenceCount = 0;
					const remainingSuggestion = lastSuggestion.substring(trimmedCurrentLineText.length);
					const range = new vscode.Range(position.line, leadingSpacesCount + trimmedCurrentLineText.length, position.line, leadingSpacesCount + trimmedCurrentLineText.length);

					return {
						items: [{
							insertText: remainingSuggestion,
							range: range
						}]
					};
				} else if (lastValidInput && trimmedCurrentLineText.startsWith(lastValidInput) && differenceCount <= 10) {
					differenceCount = trimmedCurrentLineText.length - lastValidInput.length;
					const remainingSuggestion = lastSuggestion.substring(lastValidInput.length);
					const range = new vscode.Range(position.line, leadingSpacesCount + lastValidInput.length, position.line, leadingSpacesCount + lastValidInput.length);

					return {
						items: [{
							insertText: remainingSuggestion,
							range: range
						}]
					};
				} else {
					lastSuggestion = '';
					lastValidInput = '';
					differenceCount = 0;
					return;
				}
			}

			const content = document.getText();
			const serverResponse = await sendDataToServer(content);
			lastSuggestion = serverResponse.item;
			lastValidInput = '';
			differenceCount = 0;
			const range = new vscode.Range(position, position);

			return {
				items: [{
					insertText: lastSuggestion,
					range: range
				}]
			};
		}
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);


};



async function sendDataToServer(data: string) {
    try {
        const response = await axios.post('http://localhost:3000/api', { content: data, cursorPosition: null });
        return response.data;
    } catch (error) {
        console.error('Error sending data to server:', error);
        return null;
    }
}

async function provideInlineCompletionItems(
	document: vscode.TextDocument, 
    position: vscode.Position, 
    context: vscode.InlineCompletionContext, 
    token: vscode.CancellationToken) {
	console.log('provideInlineCompletionItems triggered');

	// Check if the previous line is a comment
	const prevLineText = document.lineAt(position.line - 1).text;
	if (!prevLineText.trim().startsWith('//')) {
		return;
	}

	// Fetch the current line's text
	const currentLineText = document.lineAt(position.line).text;

	// If there's non-whitespace content on the current line, don't provide a suggestion
	if (currentLineText.trim().length > 0) {
		return;
	}

	// Fetch suggestion from the server
	const content = document.getText();
	const serverResponse = await sendDataToServer(content);
	console.log('serverResponse:', serverResponse.item);

	// Provide the suggestion at the cursor's current position
	const range = new vscode.Range(position, position);
	const text = serverResponse.item;

	return {
		items: [{
			insertText: text,
			range: range
		}]
	};
}