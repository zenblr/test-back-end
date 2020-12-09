/**
 * @swagger
 * /customer/app/customer-wallet:
 *   get:
 *     tags:
 *       -  Customer Wallet
 *     name: read deposit request
 *     summary: To read wallet deposit request
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "search"
 *       in: "query"
 *       description: "search your keyword"
 *       type: "string"
 *     - name: "from"
 *       in: "query"
 *       description: "Pagination starting point"
 *       type: "string"
 *     - name: "to"
 *       in: "query"
 *       description: "Pagination ending point"
 *       type: "string"
 *     - name: "paymentFor"
 *       in: "query"
 *       description: "paymentFor"
 *       type: "string"
 *     responses:
 *       200:
 *          description: deposit request fetch successfully
 *       404:
 *          description: no deposit request found
 * /customer/app/customer-wallet/pay:
 *   post:
 *     tags:
 *       - Customer Wallet
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
 *             bankTransactionId:
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
 * /customer/app/customer-wallet/add-amount:
 *   post:
 *     tags:
 *       - Customer Wallet
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
 * /customer/app/customer-wallet/{depositWithdrawId}:
 *   get:
 *     tags:
 *       - Wallet
 *     summary: To read Wallet by Id
 *     parameters:
 *     - name: "depositWithdrawId"
 *       in: "path"
 *       description: "Id of wallet to read"
 *       required: true
 *       type: integer
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Customer not found 
 */