const express = require('express');
const app = express();
const { PORT } = require('./config/config');
// const port = 4200;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

/* app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
}); */

app.listen(parseInt(PORT, 10), '::', () => {
    console.log(`Server running at ${PORT}`);
});