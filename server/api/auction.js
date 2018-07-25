const express = require('express');
const auctionController = require('../controller/auctionController');
const router = express.Router();

router.post('/reserve', auctionController.reserve_player);

module.exports = router;