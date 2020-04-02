/**
 * @swagger
 * /user/register-otp:
 *   post:
 *     tags:
 *       - Customer Registration
 *     name: Registration
 *     summary: To Register  
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
 *             lastName:
 *               type: string
 *             password:
 *               type: string
 *             mobileNumber:
 *               type: integer
 *             email:
 *               type: string
 *             panCardNumber:
 *               type: string         
 *         required:
 *           - firstName
 *           - lastName
 *           - password
 *           - mobileNumber
 *           - email
 *           - panCardNumber
 *     responses:
 *       200:
 *          description: Your otp send it on to the mobile number
 *       401:
 *          description: Something went wrong
 * /user/verify-otp:
 *   post:
 *     tags:
 *       - Customer Registration
 *     name: Verification Otp
 *     summary: To Verify Otp
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             mobileNumber:
 *               type: integer
 *             otp:
 *               type: integer
 *               
 *         required:
 *           - mobileNumber
 *           - otp
 *     responses:
 *       200:
 *          description: Success
 *       400:
 *          description: Invalid Otp
 * 
 * /user/resend-otp:
 *   post:
 *     tags:
 *       - Customer Registration
 *     name: Resend Otp
 *     summary: Resend Otp
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             mobileNumber:
 *               type: integer
 *               
 *         required:
 *           - mobileNumber
 *     responses:
 *       200:
 *          description: Otp send to your Mobile number
 *       400:
 *          description: User does not exists, please contact to Admin
 * 
 */