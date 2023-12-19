**./backend** is the local server with port 3000.

**./inline-completions** is the development for the extension.

## Console Logs in Server
Document text sent by IDE received by server.

![Alt text](image-3.png)

## Response From Server Received in IDE
![Response From Server Received in IDE](image-1.png)

## Inline Completion in Copilot Style
![Inline Completion in Copilot Style](image.png)

### Security & Warning: 
We may need to sanitize the content sent to server to avoid injection.

*e.g.* Prompt Injection, Code Injection, SQL injection, Command injection, Markdown injection.
