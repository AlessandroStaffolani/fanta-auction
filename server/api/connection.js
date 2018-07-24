const express = require('express');
const connectionController = require('../controller/connectionController');
const router = express.Router();

router.post('/emit', connectionController.emit_message);

module.exports = router;