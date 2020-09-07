/**
 * @swagger
 * /quick-pay/interest-table:
 *   get:
 *     tags:
 *       - quick pay
 *     name: Read interest table
 *     summary: To read interest table of loan
 *     parameters:
 *     - name: "masterLoanId"
 *       in: "query"
 *       description: "masterLoanId to get interest table"
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
 * /quick-pay/interest-info:
 *   get:
 *     tags:
 *       - quick pay
 *     name: To get interest info
 *     summary: To get interest info
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "masterLoanId"
 *         in: "query"
 *         description: "masterLoanId to get interest info"
 *         required: true
 *         type: "integer"
 *     responses:
 *       200:
 *          description: success
 *       400:
 *          description: failed
 * /quick-pay/payable-amount:
 *   get:
 *     tags:
 *       - quick pay
 *     name: payable amount
 *     summary: To get payable amount
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *      - name: "masterLoanId"
 *        in: "query"
 *        description: "masterLoanId to get payable amount"
 *        required: true
 *        type: "integer"
 *     responses:
 *       200:
 *          description: success
 *       400:
 *          description: failed
 * /quick-pay/confirm-payment-info:
 *   get:
 *     tags:
 *       - quick pay
 *     name: To confirm payment 
 *     summary: To confirm payment 
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *      - name: "masterLoanId"
 *        in: "query"
 *        description: "masterLoanId to confirm payment"
 *        required: true
 *        type: "integer"
 *     responses:
 *       200:
 *          description: success
 *       400:
 *          description: failed
 * /quick-pay/payment:
 *   post:
 *     tags:
 *       - quick pay
 *     name: For payment of quick-pay
 *     summary: For payment pf quick pay (payment type =  payment type=['cash', 'IMPS', 'NEFT', 'RTGS', 'cheque', 'UPI', 'gateway'])
 *     security:
 *       - bearerAuth: []
 *     cunsumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             payableAmount:
 *               required: true
 *               type: "integer"
 *             masterLoanId:
 *               required: true
 *               type: "integer"
 *             paymentDetails:
 *               type: object
 *               properties:
 *                 paymentType:
 *                   type: string
 *                 bankName:
 *                   type: string
 *                 branchName:
 *                   type: string
 *                 chequeNumber:
 *                   type: string
 *                 depositDate:
 *                   type: string
 *                 transactionId:
 *                   type: string
 *     responses:
 *       200:
 *          description: request submitted
 *       400:
 *          description: failed
 * /quick-pay/confirm-payment:
 *   post:
 *     tags:
 *       - quick pay
 *     name: For confirm part payment
 *     summary: For confirm part payment 
 *     security:
 *       - bearerAuth: []
 *     cunsumes:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             transactionId:
 *               required: true
 *               type: "string"
 *             status:
 *               type: "string"
 *               required: true
 *     responses:
 *       200:
 *          description: request submitted
 *       400:
 *          description: failed
 */