/**
 * @swagger
 * /auth/user-login:
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
 *         description: Your login success
 *       401:
 *         description: You entered wrong password
 *       404:
 *         description: User not found
 * 
 */