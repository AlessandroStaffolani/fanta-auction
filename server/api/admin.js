const express = require('express');
const auctionController = require('../controller/auctionController');
const router = express.Router();

router.post('/emit', auctionController.emit_message);

router.post('/timer/reset', auctionController.timer_reset);

router.post('/timer/start', auctionController.timer_start);

router.post('/player/current', auctionController.current_player);

module.exports = router;