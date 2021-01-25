/**
 * @swagger
 * /e-kyc/pan-details:
 *   post:
 *     tags:
 *       - E KYC API
 *     name: Get Name by pan card number
 *     summary: To get name from pan card
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             panCardNumber:
 *               type: string
 *         required:
 *           - panCardNumber
 *     responses:
 *       200:
 *          description: Name from pancard
 *       400:
 *          description: Invalid Pan Card number
 * /e-kyc/name-similarity:
 *   post:
 *     tags:
 *       - E KYC API
 *     name: name similarity
 *     summary: to check name similarity with score
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             name1:
 *               type: string
 *             name2:
 *               type: string
 *         required:
 *           - name1
 *           - name2
 *     responses:
 *       200:
 *          description: If both name same
 *       400:
 *          description: Name does not match
 * /e-kyc/pan-status:
 *   post:
 *     tags:
 *       - E KYC API
 *     name: Pan status check api
 *     summary: to check pan status
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             panCardNumber:
 *               type: string
 *             fullName:
 *               type: string
 *             dateOfBirth:
 *               type: string
 *         required:
 *           - panCardNumber
 *           - fullName
 *           - dateOfBirth
 *     responses:
 *       200:
 *          description: varified pan 
 *       400:
 *          description: Invalid ID Number or combination of inputs
 */
