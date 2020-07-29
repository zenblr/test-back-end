/**
 * @swagger
 * /auth/user-login:
 *   post:
 *     tags:
 *       - Authentication
 *     name: userLogin
 *     summary: To get  user login 
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             mobileNumber:
 *               type: string
 *             password:
 *               type: string
 *               format: password
 *         required:
 *           - mobileNumber
 *           - password
 *     responses:
 *       200:
 *         description: Your login success
 *       401:
 *         description: Wrong Credentials
 *       404:
 *         description: User not found
 * /auth/verify-customer-login:
*   post:
 *     tags:
 *       - Authentication
 *     name: userLogin
 *     summary: To get customer login 
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             referenceCode:
 *               type: string
 *             otp:
 *               type: number
 *         required:
 *           - referenceCode
 *           - otp
 *     responses:
 *       200:
 *         description: login successful
 *       400:
 *         description:  Your time is expired. Please click on resend otp
 * 
 * /auth/customer-login:
 *   post:
 *     tags:
 *       - Authentication
 *     name: Customer Login
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
 * /customer/send-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     name: send otp
 *     summary: To get customer login 
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             mobileNumber:
 *               type: string
 *         required:
 *           - mobileNumber
 *     responses:
 *       200:
 *         description: Otp send to your entered mobile number.
 *       401:
 *         description: Wrong Credentials
 *       404:
 *         description: Mobile number is not Exist.
 *   
 */