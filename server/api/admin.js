const express = require('express');
const auctionController = require('../controller/auctionController');
const playerController = require('../controller/playerController');
const router = express.Router();

router.post('/emit', auctionController.emit_message);

router.post('/timer/reset', auctionController.timer_reset);

router.post('/timer/start', auctionController.timer_start);

router.post('/player/next', playerController.next_player);

router.post('/player/load', playerController.load_player);

module.exports = router;