const express = require('express');
const adminController = require('../controller/adminController');
const router = express.Router();

router.post('/emit', adminController.emit_message);

router.post('/timer/reset', adminController.timer_reset);

router.post('/timer/update', adminController.timer_update);

router.post('/player/current', adminController.current_player);

module.exports = router;