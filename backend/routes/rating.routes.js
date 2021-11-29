const express = require('express');
const routes = express.Router();

const { getRating } = require('../controllers/rating');

routes.get('/getRating', getRating);

module.exports = routes;