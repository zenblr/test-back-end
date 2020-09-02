/**
 * @swagger
 * /customer/app/jewellery-release/{masterLoanId}:
 *   get:
 *     tags:
 *       - Ornament release customer app
 *     name: Read ornament details
 *     summary: To read ornaments details by masterLoanId
 *     parameters:
 *     - name: "masterLoanId"
 *       in: "path"
 *       description: "masterLoanId to get ornaments"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: data not found
 * /customer/app/jewellery-release:
 *   post:
 *     tags:
 *       - Ornament release customer app
 *     name: To get release amount and details
 *     summary: To get release amount
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
 *             masterLoanId:
 *               type: integer
 *             ornamentId:
 *               type: array
 *               items:
 *                 type: integer
 *         required:
 *           - masterLoanId
 *           - ornamentId
 *     responses:
 *       200:
 *          description: release amount and details
 *       400:
 *          description: failed
 * /customer/app/jewellery-release/part-release:
 *   post:
 *     tags:
 *       - Ornament release customer app
 *     name: Payment Confirmation of part release
 *     summary: Payment Confirmation of part release payment type=['cash', 'IMPS', 'NEFT', 'RTGS', 'cheque', 'UPI', 'gateway']
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
 *             paymentType:
 *               type: string
 *             paidAmount:
 *               type: integer
 *             bankName:
 *               type: string
 *             branchName:
 *               type: string
 *             chequeNumber:
 *               type: string
 *             depositDate:
 *               type: string
 *             transactionId:
 *               type: string
 *             masterLoanId:
 *               type: integer
 *             ornamentId:
 *               type: array
 *               items:
 *                 type: integer
 *     responses:
 *       200:
 *          description: request submitted
 *       400:
 *          description: failed
 * /customer/app/jewellery-release/customer/{customerId}:
 *   get:
 *     tags:
 *       - Ornament release customer app
 *     name: Read customer details
 *     summary: To read customer details
 *     parameters:
 *     - name: "customerId"
 *       in: "path"
 *       description: "customerId to get customer"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: data not found
 * /customer/app/jewellery-release/full-release:
 *   post:
 *     tags:
 *       - Ornament release customer app
 *     name: Payment Confirmation of part release
 *     summary: Payment Confirmation of part release payment type=['cash', 'IMPS', 'NEFT', 'RTGS', 'cheque', 'UPI', 'gateway']
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
 *             paymentType:
 *               type: string
 *             paidAmount:
 *               type: integer
 *             bankName:
 *               type: string
 *             branchName:
 *               type: string
 *             chequeNumber:
 *               type: string
 *             depositDate:
 *               type: string
 *             transactionId:
 *               type: string
 *             masterLoanId:
 *               type: integer
 *             ornamentId:
 *               type: array
 *               items:
 *                 type: integer
 *     responses:
 *       200:
 *          description: release request submitted
 *       400:
 *          description: failed
 */


