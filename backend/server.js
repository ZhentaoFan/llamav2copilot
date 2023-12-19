const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/api', (req, res) => {
    console.log('Data received:', req.body.content);
    res.send({ status: 'Received', item: "123456" });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
