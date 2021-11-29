const axios = require('axios');

const getRating = async (req, res) => {
    const config = {
        params: { ratingId: req.body.ratingId }
    }

    axios.get(`localhost:5020/`)
}

module.exports = {
    getRating
}