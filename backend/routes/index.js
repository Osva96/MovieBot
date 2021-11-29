const express = require('express');
const routes = express.Router();

const HTTPStatus = require('http-status');

const recomendationRoutes = require('./recomendation.routes');
const ratingRoutes = require('./rating.routes');
const informationRoutes = require('./information.routes');

routes.use('/recomendation', recomendationRoutes);
routes.use('/rating', ratingRoutes);
routes.use('/information', informationRoutes);

routes.get('/', function name(req, res) {
    return res.json({ success: true, message: 'Entrypoint' });
});

routes.all('*', (req, res) => 
    res.status(HTTPStatus.NOT_FOUND).json({
        success: 'false',
        error: 'Endpoint not found'
    }),
);

module.exports = routes;