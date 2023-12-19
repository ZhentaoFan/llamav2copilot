const express = require('express');
const bodyParser = require('body-parser');
const { sanitizeInput, checkSanitization } = require('./sanitizer/sanitizer-code-Llamav2');
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/api', 
    // sanitizeInput(), 
    // checkSanitization, 
    (req, res) => {
    console.log('Data received:', req.body.content);
    res.send({ status: 'Received', item: `
        html injection
        <li>
            <button class="delete">Delete</button>
        </li>
    `});
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
