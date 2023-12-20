const express = require('express');
const bodyParser = require('body-parser');
const { sanitizeInput, checkSanitization } = require('./sanitizer/sanitizer-code-Llamav2');
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

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
