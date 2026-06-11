const express = require('express');
const router = express.Router();
const { login, resetPassword, updateProfile } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateLogin, validateResetPassword } = require('../middleware/validationMiddleware');

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@tms.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password on first login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_password
 *             properties:
 *               new_password:
 *                 type: string
 *                 example: NewPass@123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/reset-password', verifyToken, validateResetPassword, resetPassword);

router.patch('/profile', verifyToken, updateProfile);

module.exports = router;