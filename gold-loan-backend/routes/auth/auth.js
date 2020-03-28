var express = require('express');
var router = express.Router();

const { userLogin } = require('../../controllers/auth/authController');
const { wrapper } = require('../../utils/errorWrap')


router.post('/userLogin', wrapper(userLogin));



module.exports = router;

/**
 * @swagger
 * /auth/userLogin:
 *   post:
 *     tags:
 *       - Authentication
 *     name: userLogin
 *     summary: To get login 
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             password:
 *               type: string
 *               format: password
 *         required:
 *           - firstName
 *           - password
 *     responses:
 *       200:
 *         description: Your refresh token
 *       401:
 *         description: You entered wrong password
 *       404:
 *         description: User not found
 * 
 */