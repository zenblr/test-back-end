/**
 * @swagger
 * /customer/app/wallet/pay:
 *   post:
 *     tags:
 *       - wallet
 *     name: wallwt
 *     summary: add Wallet Amount Temp(step 1)  
 *     consumes:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *             paymentType:
 *               type: string
 *             depositDate:
 *               type: string
 *             chequeNumber:
 *               type: string
 *             bankName:
 *               type: string
 *             branchName:
 *               type: string     
 *         required:
 *           - amount
 *           - paymentType
 *           - depositDate
 *     responses:
 *       200:
 *          description: success
 *       404:
 *          description: failed to add amount to the wallet
 * /customer/app/wallet/add-amount:
 *   post:
 *     tags:
 *       - wallet
 *     name: wallwt
 *     summary: add Wallet Amount(step 2)  
 *     consumes:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             razorpay_order_id:
 *               type: string
 *             razorpay_payment_id:
 *               type: string
 *             razorpay_signature:
 *               type: string
 *             transactionUniqueId:
 *               type: string
 *     responses:
 *       200:
 *          description: success
 *       404:
 *          description: Amount added successfully
 */