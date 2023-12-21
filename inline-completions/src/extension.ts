import * as vscode from "vscode";
import { Range } from "vscode";
import axios from "axios";

// 1. auto-compele (basic funcitonality)
// 2. summarize the funciton (documentation), class generation
// 3. optimization

export function activate(context: vscode.ExtensionContext) {
  console.log("inline-completions demo started");
  vscode.commands.registerCommand("demo-ext.command1", async (...args) => {
    console.log("command1 called with args:", args);
    vscode.window.showInformationMessage("command1: " + JSON.stringify(args));
  });

  let lastSuggestion = "";
  let lastValidInput = "";
  let differenceCount = 0;
  const maxDifferenceCount = 4;

  const commentProvider: vscode.InlineCompletionItemProvider = {
    async provideInlineCompletionItems(document, position, context, token) {
      console.log("provideInlineCompletionItems triggered");

      const prevLineText = document.lineAt(position.line - 1).text;
      if (
        !(
          prevLineText.trim().startsWith("//") ||
          prevLineText.trim().startsWith("#")
        )
      ) {
        return;
      }

      // Get the current line's text, excluding leading spaces
      const currentLineText = document.lineAt(position.line).text;
      const trimmedCurrentLineText = currentLineText.trimStart();
      const leadingSpacesCount =
        currentLineText.length - trimmedCurrentLineText.length;

      if (trimmedCurrentLineText.length !== 0) {
        if (lastSuggestion.startsWith(trimmedCurrentLineText)) {
          lastValidInput = trimmedCurrentLineText;
          differenceCount = 0;
          const remainingSuggestion = lastSuggestion.substring(
            trimmedCurrentLineText.length,
          );
          const range = new vscode.Range(
            position.line,
            leadingSpacesCount + trimmedCurrentLineText.length,
            position.line,
            leadingSpacesCount + trimmedCurrentLineText.length,
          );

          return {
            items: [
              {
                insertText: remainingSuggestion,
                range: range,
              },
            ],
          };
        } else if (
          lastValidInput &&
          trimmedCurrentLineText.startsWith(lastValidInput) &&
          differenceCount <= maxDifferenceCount
        ) {
          differenceCount =
            trimmedCurrentLineText.length - lastValidInput.length;
          const remainingSuggestion = lastSuggestion.substring(
            lastValidInput.length,
          );
          const range = new vscode.Range(
            position.line,
            leadingSpacesCount + lastValidInput.length,
            position.line,
            leadingSpacesCount + lastValidInput.length,
          );

          return {
            items: [
              {
                insertText: remainingSuggestion,
                range: range,
              },
            ],
          };
        } else {
          lastSuggestion = "";
          lastValidInput = "";
          differenceCount = 0;
          return;
        }
      }

      const content = document.getText();
      const serverResponse = await sendCommentToServer(
        content,
        position,
        prevLineText,
      );
      lastSuggestion = serverResponse.item;
      lastValidInput = "";
      differenceCount = 0;
      const range = new vscode.Range(position, position);

      return {
        items: [
          {
            insertText: lastSuggestion,
            range: range,
          },
        ],
      };
    },
  };

  const codeProvider: vscode.InlineCompletionItemProvider = {
    async provideInlineCompletionItems(document, position, context, token) {
      console.log("Code provideInlineCompletionItems triggered");

      const currentLineText = document.lineAt(position.line).text;
      // avoid to trigger when the line is a comment
      if (
        currentLineText.trim().startsWith("//") ||
        currentLineText.trim().startsWith("#")
      ) {
        return;
      }
      const prevLineText = document.lineAt(position.line - 1).text;
      // avoid to trigger when the previous line is a comment
      if (
        prevLineText.trim().startsWith("//") ||
        prevLineText.trim().startsWith("#")
      ) {
        return;
      }
      const trimmedCurrentLineText = currentLineText.trimStart();
      const leadingSpacesCount =
        currentLineText.length - trimmedCurrentLineText.length;

      if (trimmedCurrentLineText.length !== 0) {
        // if (lastSuggestion && trimmedCurrentLineText[0] === lastSuggestion[0]) {

        if (lastSuggestion.startsWith(trimmedCurrentLineText)) {
          lastValidInput = trimmedCurrentLineText;
          differenceCount = 0;
          const remainingSuggestion = lastSuggestion.substring(
            trimmedCurrentLineText.length,
          );
          const range = new vscode.Range(
            position.line,
            leadingSpacesCount + trimmedCurrentLineText.length,
            position.line,
            leadingSpacesCount + trimmedCurrentLineText.length,
          );

          return {
            items: [
              {
                insertText: remainingSuggestion,
                range: range,
              },
            ],
          };
        } else if (
          lastValidInput &&
          trimmedCurrentLineText.startsWith(lastValidInput) &&
          differenceCount <= maxDifferenceCount
        ) {
          differenceCount =
            trimmedCurrentLineText.length - lastValidInput.length;
          const remainingSuggestion = lastSuggestion.substring(
            lastValidInput.length,
          );
          const range = new vscode.Range(
            position.line,
            leadingSpacesCount + lastValidInput.length,
            position.line,
            leadingSpacesCount + lastValidInput.length,
          );

          return {
            items: [
              {
                insertText: remainingSuggestion,
                range: range,
              },
            ],
          };
        }
        else {
            lastSuggestion = "";
            lastValidInput = "";
            differenceCount = 0;

            // Fetch new suggestion from the server
            const serverResponse = await sendCodeToServer(
              document.getText(),
              position,
              currentLineText,
            );
            if (serverResponse && serverResponse.item) {
              lastSuggestion = serverResponse.item;
              lastValidInput = trimmedCurrentLineText;
              const range = new vscode.Range(position, position);

              return {
                items: [
                  {
                    insertText: lastSuggestion,
                    range: range,
                  },
                ],
              };
            }
        }
      }

      const content = document.getText();
      const serverResponse = await sendCodeToServer(
        content,
        position,
        currentLineText,
      );
      if (!serverResponse || !serverResponse.item) {
        return;
      }

      lastSuggestion = serverResponse.item;
      lastValidInput = trimmedCurrentLineText;
      differenceCount = 0;
      const range = new vscode.Range(position, position);

      return {
        items: [
          {
            insertText: lastSuggestion,
            range: range,
          },
        ],
      };
    },
  };

  async function provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    isComment: boolean,
  ) {
    // ... Common logic for providing inline completion items
    // Use `isComment` to distinguish between comment and code logic

    const currentLineText = document.lineAt(position.line).text;
    if (!isComment) {
      if (
        currentLineText.trim().startsWith("//") ||
        currentLineText.trim().startsWith("#")
      ) {
        return;
      }
      const prevLineText = document.lineAt(position.line - 1).text;
      if (
        prevLineText.trim().startsWith("//") ||
        prevLineText.trim().startsWith("#")
      ) {
        return;
      }
    } else {
      if (
        !(
          currentLineText.trim().startsWith("//") ||
          currentLineText.trim().startsWith("#")
        )
      ) {
        return;
      }
    }
    const trimmedCurrentLineText = currentLineText.trimStart();
    const leadingSpacesCount =
      currentLineText.length - trimmedCurrentLineText.length;

    if (trimmedCurrentLineText.length !== 0) {
      if (lastSuggestion.startsWith(trimmedCurrentLineText)) {
        lastValidInput = trimmedCurrentLineText;
        differenceCount = 0;
        const remainingSuggestion = lastSuggestion.substring(
          trimmedCurrentLineText.length,
        );
        const range = new vscode.Range(
          position.line,
          leadingSpacesCount + trimmedCurrentLineText.length,
          position.line,
          leadingSpacesCount + trimmedCurrentLineText.length,
        );

        return {
          items: [
            {
              insertText: remainingSuggestion,
              range: range,
            },
          ],
        };
      } else if (
        lastValidInput &&
        trimmedCurrentLineText.startsWith(lastValidInput) &&
        differenceCount <= maxDifferenceCount
      ) {
        differenceCount = trimmedCurrentLineText.length - lastValidInput.length;
        const remainingSuggestion = lastSuggestion.substring(
          lastValidInput.length,
        );
        const range = new vscode.Range(
          position.line,
          leadingSpacesCount + lastValidInput.length,
          position.line,
          leadingSpacesCount + lastValidInput.length,
        );

        return {
          items: [
            {
              insertText: remainingSuggestion,
              range: range,
            },
          ],
        };
      } else {
        if (differenceCount > maxDifferenceCount) {
          lastSuggestion = "";
          lastValidInput = "";
          differenceCount = 0;
        }
        return;
      }
    }

    const content = document.getText();
    let serverResponse = null;
    if (isComment) {
      const prevLineText = document.lineAt(position.line - 1).text;
      serverResponse = await sendCommentToServer(
        content,
        position,
        prevLineText,
      );
    } else {
      serverResponse = await sendCodeToServer(
        content,
        position,
        currentLineText,
      );
    }
    if (!serverResponse || !serverResponse.item) {
      return;
    }

    lastSuggestion = serverResponse.item;
    lastValidInput = trimmedCurrentLineText;
    differenceCount = 0;
    const range = new vscode.Range(position, position);

    return {
      items: [
        {
          insertText: lastSuggestion,
          range: range,
        },
      ],
    };
  }

  // Register the comment inline completion provider
  context.subscriptions.push(
    vscode.languages.registerInlineCompletionItemProvider(
      { pattern: "**" },
      commentProvider,
    ),
  );

  // Register the code inline completion provider
  context.subscriptions.push(
    vscode.languages.registerInlineCompletionItemProvider(
      { pattern: "**" },
      codeProvider,
    ),
  );
}

async function sendCommentToServer(
  content: string,
  cursorPosition: vscode.Position,
  instruction: string,
) {
  try {
    const response = await axios.post("http://localhost:3000/api/comment", {
      content: content,
      cursorPosition: cursorPosition,
      instruction: instruction,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending data to server:", error);
    return null;
  }
}

async function sendCodeToServer(
  content: string,
  cursorPosition: vscode.Position,
  curLineCode: string,
) {
  try {
    const response = await axios.post("http://localhost:3000/api/code", {
      content: content,
      cursorPosition: cursorPosition,
      curLineCode: curLineCode,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending data to server:", error);
    return null;
  }
}
