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
 *       - Customer Wallet
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
 * /customer/app/customer-wallet/deposit-detail:
 *   get:
 *     tags:
 *       - Customer Wallet
 *     name: Customer-deposit-api
 *     summary: To get deposite and Withdraw Details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "search"
 *         in: "query"
 *         description: "search your keyword"
 *         type: "string"
 *       - name: "from"
 *         in: "query"
 *         description: "Pagination starting point"
 *         type: "string"
 *       - name: "to"
 *         in: "query"
 *         description: "Pagination ending point"
 *         type: "string"
 *       - name: "orderTypeId"
 *         in: "query"
 *         description: "orderTypeId"
 *         type: "string" 
 *     responses: 
 *       200: 
 *         description: deposite/Withdraw details are fetch successfully 
 *       404: 
 *         description: No deposite/Withdraw details found 
 * /customer/app/customer-wallet/transaction-detail: 
 *   get:
 *     tags:
 *       - Customer Wallet
 *     name: Transaction Details
 *     summary: To get transaction details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "search"
 *         in: "query"
 *         description: "search your keyword"
 *         type: "string"
 *       - name: "from"
 *         in: "query"
 *         description: "Pagination starting point"
 *         type: "string"
 *       - name: "to"
 *         in: "query"
 *         description: "Pagination ending point"
 *         type: "string"
 *       - name: "paymentFor"
 *         in: "query"
 *         description: "paymentFor"
 *         type: "string"
 *     responses:
 *       200:
 *         description: Transaction details are fetch successfully
 *       404:
 *         description: No Transaction details found
 * /customer/app/augmont-bank-detail:
 *   get:
 *     tags:
 *       - Customer Wallet
 *     name: Augmont Bank details
 *     summary: To get augmont Bank details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Augmont Bank details are fetch successfully
 *       404:
 *         description: No bank details found.
 * /customer/app/customer-wallet/wallet-balance:
 *   get:
 *     tags:
 *       - Customer Wallet
 *     name: Customer wallet details
 *     summary: To get customer wallet details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: customer wallet details are fetch successfully
 *       404:
 *         description: No bank details found.
 * /customer/app/customer-wallet/withdraw-amount:
 *   post:
 *     tags:
 *       - Customer Wallet
 *     name: withdraw amount
 *     summary: withdraw amount  
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
 *             withdrawAmount:
 *               type: number
 *             bankName:
 *               type: string
 *             branchName:
 *               type: string
 *             accountHolderName:
 *               type: string
 *             accountNumber:
 *               type: string
 *             ifscCode:
 *               type: string
 *     responses:
 *       200:
 *          description: success
 *       404:
 *          description: Insuffcient balance
 */