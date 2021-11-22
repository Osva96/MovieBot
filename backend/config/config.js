const dotenv = require('dotenv');

dotenv.config();

/**
 * Export configuration.
 */
module.exports = {
    PORT: process.env.PORT,
};