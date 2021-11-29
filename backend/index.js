// Import of express library.
const express = require('express');
// Import of cors library.
const cors = require('cors');

// Variable with express solution.
const app = express();

// Specific route of API
const routes = require('./routes/');

const { PORT, API_VERSION } = require('./config/config');

// Parse request of content type application/json
app.use(express.json());

// Parse request of content type application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const API_URL = `/api/v${API_VERSION}`;

const whitelist = ['localhost:3978'];

app.use(cors({ origin: whitelist }));

app.use(API_URL, routes);

// Home simple rute
app.get("/", (req, res) => {
    res.json({ message: "Hello World!" });
});

// Set port and listen requests
app.listen(parseInt(PORT, 10), '::', () => {
    console.log(`Server is running in port ${ PORT }.`);
});