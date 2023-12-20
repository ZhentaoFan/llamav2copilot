const express = require('express');
const bodyParser = require('body-parser');
const { sanitizeInput, checkSanitization } = require('./sanitizer/sanitizer-code-Llamav2');
const OpenAI = require('openai');
require('dotenv').config();
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const app = express();
const port = 3000;
const axios = require('axios');

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
    async (req, res) => {
    ////////////////////////
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



// app.post('/api/code', 
//     // sanitizeInput(), 
//     // checkSanitization, 
//     async (req, res) => {
//     ////////////////////////
//     counter++;
//     console.log('Document received:', req.body.content);
//     console.log('Cursor Position received:', req.body.cursorPosition);
//     console.log('Current Code received:', req.body.curLineCode);
//     const response = await axios.post('https://api.openai.com/v1/chat/completions', {
//             model: "gpt-3.5-turbo",
//             messages: [
//                 { role: "system", content: "You are a machine for code auto completion. Here is the incomplete code with the entire document, current cursor, and the current line. Give me the code directly, don't act like a chatbot. Anything other than code should be commented out." },
//                 { role: "user", content:  `The entire file is ${req.body.content},
//                 The current line is ${req.body.curLineCode},
//                 The current cursor is ${req.body.cursorPosition},
//                 Please complete the code and start from the cursor position. Don't repeat the previous code. 
//                 `}
//             ]
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//         console.log(response.data.choices[0].message.content);
//         res.send({ item: response.data.choices[0].message.content });
// });


// app.post('/api/comment', async (req, res) => {
//     try {
//         console.log('Instruciton received:', req.body.instruction);
//         const response = await axios.post('https://api.openai.com/v1/chat/completions', {
//             model: "gpt-3.5-turbo",
//             messages: [
//                 { role: "system", content: "You are a helpful assistant for coding." },
//                 { role: "user", content: req.body.instruction }
//             ]
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//         console.log(response.data.choices[0].message.content);
//         res.send({ item: response.data.choices[0].message.content });

//     } catch (error) {
//         console.error("Error in calling OpenAI:", error);
//         res.status(500).send({ error: "Error generating response" });
//     }
// });

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
