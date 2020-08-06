/**
 * @swagger
 * /loan-transfer:
 *   get:
 *     tags:
 *       -  Customer Loan Transfer
 *     name: read loan transfer list
 *     summary: To read loan transfer list
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
 *     responses:
 *       200:
 *          description: Loan transfer list fetch successfully
 *       404:
 *          description: no loan transfer details found
 * /loan-transfer/basic-details:
 *   post:
 *     tags:
 *       - Customer Loan Transfer
 *     summary: submit basic details (step 1)
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             customerId:
 *               type: integer
 *             customerUniqueId:
 *               type: string
 *             kycStatus: 
 *               type: string
 *             startDate: 
 *               type: string
 *             masterLoanId: 
 *               type: integer
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: customer loan transfer basics details added.
 *       422:
 *         description: failed to add details
 * /loan-transfer/documents:
 *   post:
 *     tags:
 *       - Customer Loan Transfer
 *     summary: submit documents (step 2)
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             loanId:
 *               type: integer
 *             masterLoanId: 
 *               type: integer
 *             outstandingLoanAmount:
 *               type: integer
 *             pawnTicket: 
 *               type: array
 *               items: 
 *                type:string 
 *             signedCheque: 
 *               type: array
 *               items: 
 *                type:string 
 *             declaration: 
 *               type: array
 *               items: 
 *                type:string 
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: customer loan transfer document added.
 *       422:
 *         description: failed to add documents
 * /loan-transfer/appraiser-rating:
 *   post:
 *     tags:
 *       - Customer Loan Transfer
 *     summary: appraiser rating (step 3)
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             loanId:
 *               type: integer
 *             masterLoanId: 
 *               type: integer
 *             loanTransferStatusForAppraiser:
 *               type: string
 *             reasonByAppraiser:
 *               type: string
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: customer loan transfer appraiser rating done.
 *       422:
 *         description: failed to do appraiser rating
 * /loan-transfer/bm-rating:
 *   post:
 *     tags:
 *       - Customer Loan Transfer
 *     summary: BM rating (step 4)
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             loanId:
 *               type: integer
 *             masterLoanId: 
 *               type: integer
 *             loanTransferStatusForBM:
 *               type: string
 *             reasonByBM: 
 *               type: string
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: customer loan transfer BM rating done.
 *       422:
 *         description: failed to do BM rating
 * /loan-transfer/disbursal:
 *   post:
 *     tags:
 *       - Customer Loan Transfer
 *     summary: disbursal (step 5)
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             loanId:
 *               type: integer
 *             masterLoanId: 
 *               type: integer
 *             transactionId:
 *               type: string
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: customer loan transfer disbursal done.
 *       422:
 *         description: failed to do disbursal
 * /loan-transfer/{customerUniqueId}:
 *   get:
 *     tags:
 *       - Customer Loan Transfer
 *     summary: To read customer loan details by customer unique Id
 *     parameters:
 *     - name: "customerUniqueId"
 *       in: "path"
 *       description: "Id of customer Unique Id to read"
 *       required: true
 *       type: string
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: customer details fetch successfully.
 *       400:
 *         description: This customer Did not assign in to anyone/This customer is not assign to you
 *       404:
 *         description: no customer details found
 * /loan-transfer/apply-loan/{customerUniqueId}:
 *   get:
 *     tags:
 *       - Customer Loan Transfer
 *     summary: To read customer loan details by customer unique Id while apply loan
 *     parameters:
 *     - name: "customerUniqueId"
 *       in: "path"
 *       description: "Id of customer Unique Id to read"
 *       required: true
 *       type: string
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: customer details fetch successfully.
 *       400:
 *         description: This customer Did not assign in to anyone/This customer is not assign to you
 *       404:
 *         description: no customer details found
 * /loan-transfer/single-loan:
 *   get:
 *     tags:
 *       - Customer Loan Transfer
 *     summary: To read customer loan details by customer unique Id
 *     parameters:
 *     - name: "customerLoanId"
 *       in: "query"
 *       description: "Id of customer loan Id to read"
 *       required: true
 *       type: integer
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: customer loan transfer details fetch successfully.
 *       404:
 *         description: no customer details found
 */