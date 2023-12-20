const express = require('express');
const bodyParser = require('body-parser');
const { sanitizeInput, checkSanitization } = require('./sanitizer/sanitizer-code-Llamav2');
const OpenAI = require('openai');
require('dotenv').config();
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const app = express();
const port = 3000;

app.use(bodyParser.json());

let counter = 0;

app.post('/api/comment', 
    // sanitizeInput(), 
    // checkSanitization, 
    (req, res) => {
    counter++;
    console.log('Document received:', req.body.content);
    console.log('Cursor Position received:', req.body.cursorPosition);
    console.log('Instruction received:', req.body.instruction);
    res.send({ status: 'Received', item: 
`comment: ${counter} ${counter}${counter}${counter}${counter}${counter}${counter}${counter}${counter}

    comment from server 1
    comment from server 2

hello from server 3`
    });
});


app.post('/api/code', 
    // sanitizeInput(), 
    // checkSanitization, 
    (req, res) => {
    counter++;
    console.log('Document received:', req.body.content);
    console.log('Cursor Position received:', req.body.cursorPosition);
    console.log('Current Code received:', req.body.curLineCode);
    res.send({ status: 'Received', item: 
`code: ${counter} ${counter}${counter}${counter}${counter}${counter}${counter}${counter}${counter}

    code from server 1
    code from server 2

hello from server 3`
    });
});


// app.post('/api/comment', async (req, res) => {
//     try {
//         const completion = await openai.chat.completions.create({
//             messages: [
//                 { role: "user", content: req.body.instruction }
//             ],
//             model: "gpt-3.5-turbo",
//         });

//         res.send({ item: completion.choices[0].message.content });
//     } catch (error) {
//         console.error("Error in calling OpenAI:", error);
//         res.status(500).send({ error: "Error generating response" });
//     }
// });

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
