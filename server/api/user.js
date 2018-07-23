const express = require('express');
const userController = require('../controller/userController');
const router = express.Router();

/**
 * Get all user
 */
router.get('/', userController.get_all_user);

/**
 * Return user document searched by id (no password and salt)
 * @param id must be mongo id object
 */
router.get('/:id', userController.get_user);

/**
 * Post new user
 * Body must be an object with user data
 * {
 *      user: {
 *              username: String,
 *              password: String,
 *              role: String [optional]
 *      }
 * }
 */
router.post('/', userController.post_user);

/**
 * Update user document, no password use specific request
 * @param id must be mongo user object id
 * Body must be an object with user data
 * {
 *      user: {
 *              username: String,
 *              password: String,
 *              role: String [optional]
 *      }
 * }
 */
router.put('/:id', userController.update_user);

/**
 * Reset user password
 * @param id must be mongo user object id
 * Body must be an object with user password data
 * {
 *      user: {
 *              username: String,
 *              oldPassword: String,
 *              newPassword: String
 *      }
 * }
 */
router.put('/:id/password', userController.reset_user_password);

/**
 * Delete user document
 * @param id must be mongo user object id
 */
router.delete('/:id', userController.delete_user);

module.exports = router;