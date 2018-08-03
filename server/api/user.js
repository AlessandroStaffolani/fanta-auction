const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();

router.get('/:username/all', userController.get_all_info_user);

module.exports = router;