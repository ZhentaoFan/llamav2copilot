import * as vscode from "vscode";
import { Range } from "vscode";
import axios from "axios";

// 1. auto-compele (basic funcitonality)
// 2. summarize the funciton (documentation), class generation
// 3. optimization

// Vision for our product:
// - 1. Basic functionality:
//      - 1.1. User Friendly: Don't teach users
//	  	- 1.2. Code Quality:
//       	- 1.2.1. Extendibility: Functionality can be extended
//      	- 1.2.1. Vulnerability: Design can be modulized for the convenience of adjustment and maintainance
//      - 1.3. Performance:
//          - 1.3.1. Time:
//			- 1.3.2. Response:
//          - 1.3.3. Server Load: (request rate, request size, response size.....)
//      - 1.4. Security:
//         - 1.4.1. Data Security: Context Injection/User Indepedency.
//         - 1.4.2. Server Security: Prompt Injection, DDOS
//      - 1.5. Scalability:
//   Notice: API and Prompt designs highly depend on the fine-tuning and LLM itself.

// - 2. Advanced functionality:
//      - 2.1. Documentation
//      - 2.2. Code Optimization
//      - 2.3. Code Analysis

// - 3. Ambitions:
//      - 3.1. In-File Chatbot:
//			- 3.1.1. In-File ChatWindow: integration of the chatbot and the code editor
//      - 3.2. Code Bot:
//			- 3.2.1. Interface with IDE
//			- 3.2.2. Code Completion & Code Running Environment
//			- 3.2.3. Code Begugging & Code Testing
//          - 3.2.4. Code Analysis & Code Optimization

export function activate(context: vscode.ExtensionContext) {
  console.log("inline-completions demo started");

  // Commmand API demo
  vscode.commands.registerCommand("demo-ext.command1", async (...args) => {
    console.log("command1 called with args:", args);
    vscode.window.showInformationMessage("command1: " + JSON.stringify(args));
  });

  // Timmer code (This part is lost due to a bug of my laptop's Github Desktop )
  // ToDo: ...

  // global variables for inline completion
  let lastSuggestion = "";
  let lastValidInput = "";
  let latestPos = 0;
  let differenceCount = 0;
  let inComment = 2; // 0: not in comment, 1: in comment, 2: unknown
  const maxDifferenceCount = -1;

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
      inComment = 1;

      // Get the current line's text, excluding leading spaces
      const currentLineText = document.lineAt(position.line).text;
      const trimmedCurrentLineText = currentLineText.trimStart();
      const leadingSpacesCount =
        currentLineText.length - trimmedCurrentLineText.length;

      if (trimmedCurrentLineText.length !== 0) {
        if (lastSuggestion.startsWith(trimmedCurrentLineText)) {
          lastValidInput = trimmedCurrentLineText;
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
          inComment = 0;
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
        (prevLineText.trim().startsWith("//") ||
          prevLineText.trim().startsWith("#")) &&
        currentLineText.trim().length === 0 &&
        inComment
      ) {
        return;
      }
      const trimmedCurrentLineText = currentLineText.trimStart();
      const leadingSpacesCount =
        currentLineText.length - trimmedCurrentLineText.length;

      const latest = findLatestValidInput(
        trimmedCurrentLineText,
        lastSuggestion,
      );
      console.log("latest.pos: " + latest.pos);
      console.log("latestPos: " + latestPos);
      if (latest.pos < latestPos) {
        console.log("reset");
        lastSuggestion = "";
        lastValidInput = "";
        differenceCount = 0;
        latestPos = 0;
      }

      if (trimmedCurrentLineText.length !== 0) {
        if (latest.text !== "") {
          lastValidInput = latest.text;
          differenceCount = 0;
          latestPos = latest.pos;
          const remainingSuggestion = lastSuggestion.substring(
            trimmedCurrentLineText.length - latestPos,
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
        } else if (lastValidInput && differenceCount <= maxDifferenceCount) {
          differenceCount =
            trimmedCurrentLineText.length - latestPos - lastValidInput.length;
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
          latestPos = position.character;
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

function findLatestValidInput(
  currentLineText: string,
  lastSuggestions: string,
) {
  for (let i = 0; i < currentLineText.length; i++) {
    if (
      lastSuggestions.startsWith(
        currentLineText.substring(i, currentLineText.length),
      )
    )
      return {
        text: currentLineText.substring(i, currentLineText.length),
        pos: i,
      };
  }
  return { text: "", pos: 0 };
}
