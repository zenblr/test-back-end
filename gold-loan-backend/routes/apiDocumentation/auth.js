/**
 * @swagger
 * /user-login:
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
 *         description: Wrong Credentials
 *       404:
 *         description: User not found
 * 
 * /verify-otp:
 *   post:
 *     tags: 
 *       - Authentication
 *     name: userLogin with otp
 *     summary: To get login with otp
 *     consumes:
 *         - application/json
 *     parameters:
 *        - name: body
 *          in: body
 *          schema:
 *            type: object
 *          properties:
 *             referenceCode:
 *               type: string
 *             otp:
 *               type: integer
 *             required:
 *              - refrenceCode
 *              - otp
 *     responses:
 *       200:
 *         description: login successful
 *       400:
 *         description:  Your time is expired. Please click on resend otp
 *       
 */