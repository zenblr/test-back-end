/**
 * @swagger
 * /customer/app/part-payment/view-log:
 *   get:
 *     tags:
 *       - part payment customer app
 *     name: Read view logs of part payment
 *     summary: To view logs of part payment
 *     parameters:
 *     - name: "masterLoanId"
 *       in: "query"
 *       description: "masterLoanId to get part payment logs"
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
 * /customer/app/part-payment/part-payment-info:
 *   get:
 *     tags:
 *       - part payment customer app
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
 * /customer/app/part-payment/check-part-amount:
 *   post:
 *     tags:
 *       - part payment customer app
 *     name: payable amount
 *     summary: To check part payment amount
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *      - name: body
 *        in: body
 *        schema:
 *          type: object
 *          properties:
 *            masterLoanId:
 *              type: integer
 *            paidAmount:
 *              type: integer
 *     responses:
 *       200:
 *          description: success
 *       400:
 *          description: failed
 * /customer/app/part-payment/confirm-payment-info:
 *   post:
 *     tags:
 *       - part payment customer app
 *     name: To confirm payment
 *     summary: To confirm payment
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
 *             paidAmount:
 *               type: integer
 *     responses:
 *       200:
 *          description: success
 *       400:
 *          description: failed
 * /customer/app/part-payment/payment:
 *   post:
 *     tags:
 *       - part payment customer app
 *     name: For payment of part payment
 *     summary: For payment pf part payment (payment type =  payment type=['cash', 'IMPS', 'NEFT', 'RTGS', 'cheque', 'UPI', 'gateway'])
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
 *             paidAmount:
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
 */