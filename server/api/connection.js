const express = require('express');
const connectionController = require('../controller/connectionController');
const router = express.Router();

router.post('/init', connectionController.init_server_socket);

module.exports = router;