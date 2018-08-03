const express = require('express');
const auctionController = require('../controller/auctionController');
const router = express.Router();

router.post('/player/offer', auctionController.init_player_offer);

router.post('/reserve/:player_id', auctionController.reserve_player);

module.exports = router;