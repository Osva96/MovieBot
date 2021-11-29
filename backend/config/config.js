const dotenv = require('dotenv');

dotenv.config();

/**
 * Export configuration.
 */
module.exports = {
    PORT: process.env.PORT,
    API_VERSION: process.env.API_VERSION
};