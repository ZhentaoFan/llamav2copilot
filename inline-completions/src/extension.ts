import * as vscode from 'vscode';
import { Range } from 'vscode';
import axios from 'axios';

export function activate(context: vscode.ExtensionContext) {
	console.log('inline-completions demo started');
	vscode.commands.registerCommand('demo-ext.command1', async (...args) => {
		console.log('command1 called with args:', args);
		vscode.window.showInformationMessage('command1: ' + JSON.stringify(args));
	});

	const provider: vscode.InlineCompletionItemProvider = {
		async provideInlineCompletionItems(document, position, context, token) {
			console.log('provideInlineCompletionItems triggered');

			// Send the entire document content to the server
			const content = document.getText();
			const serverResponse = await sendDataToServer(content);
			console.log('serverResponse:', serverResponse.item);
            // const completionItems = serverResponse.map(item => {
            //     return {
            //         insertText: new vscode.SnippetString(item.text),
            //         range: new Range(position.line, item.start, position.line, item.end)
            //     };
            // });

            // return {
            //     items: completionItems
            // };

			const regexp = /\/\/ \[(.+?),(.+?)\)(.*?):(.*)/;
			if (position.line <= 0) {
				return;
			}

			const result: vscode.InlineCompletionList = {
				items: [],
			};

			let offset = 1;
			while (offset > 0) {
				if (position.line - offset < 0) {
					break;
				}
				
				const lineBefore = document.lineAt(position.line - offset).text;
				const matches = lineBefore.match(regexp);
				if (!matches) {
					break;
				}
				offset++;

				const start = matches[1];
				const startInt = parseInt(start, 10);
				const end = matches[2];
				const endInt =
					end === '*'
						? document.lineAt(position.line).text.length
						: parseInt(end, 10);
				const flags = matches[3];
				const isSnippet = flags.includes('s');
				const text = serverResponse.item;
				// const text = matches[4].replace(/\\n/g, '\n');

				
				result.items.push({
					insertText: isSnippet ? new vscode.SnippetString(text) : text,
					range: new Range(position.line, startInt, position.line, endInt),
					command:{
						command: 'demo-ext.command1',
						title: 'My Inline Completion Demo Command',
						arguments: [1, 2],
					}
				});
			}
			return result;
		},
	};
	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);
}


async function sendDataToServer(data: string) {
    try {
        const response = await axios.post('http://localhost:3000/api', { content: data });
        return response.data;
    } catch (error) {
        console.error('Error sending data to server:', error);
        return null;
    }
}