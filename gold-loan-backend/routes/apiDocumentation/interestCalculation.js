/**
 * @swagger
 * /calculation:
 *   post:
 *     tags:
 *       - Interest calculation
 *     name: Perform interest calculation
 *     summary: To perform interest calculation date in  MM-DD-YYYY
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
 *             date:
 *               type: string
 *         required:
 *     responses:
 *       201:
 *          description: interest calculation
 *   get:
 *     tags:
 *       - Interest calculation
 *     name: get interest amount of selected loan
 *     summary: To get interest amount of selected loan
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "search your keyword"
 *       type: "integer"
 *     responses:
 *       200:
 *          description: Amount
 * /calculation/interest-table:
 *   get:
 *     tags:
 *       - Interest calculation
 *     name: get interest table in excel
 *     summary: To get interest table in excel
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *          description: interest table
 * /calculation/loan:
 *   post:
 *     tags:
 *       - Interest calculation
 *     name: Perform interest calculation for selected loan
 *     summary: To perform interest calculation date in  MM-DD-YYYY
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
 *             date:
 *               type: string
 *             masterLoanId:
 *               type: integer
 *         required:
 *     responses:
 *       201:
 *          description: interest calculation
 * /calculation/transaction-table:
 *   get:
 *     tags:
 *       - Interest calculation
 *     name: get transaction table in excel
 *     summary: To get transaction table in excel (debit, credit)
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "masterLoanId"
 *       in: "query"
 *       description: "masterLoanId of loan"
 *       type: "integer"
 *     responses:
 *       200:
 *          description: interest table
 * /calculation/interest-cron:
 *   post:
 *     tags:
 *       - Interest calculation for failed cron
 *     name: Perform interest calculation for cron
 *     summary: To perform interest calculation
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
 *             cronId:
 *               type: integer
 *         required:
 *     responses:
 *       200:
 *          description: interest calculation
 * /calculation/penal-cron:
 *   post:
 *     tags:
 *       - penal interest calculation for failed cron
 *     name: Perform penal interest calculation for cron
 *     summary: To perform penal interest calculation
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
 *             cronId:
 *               type: integer
 *         required:
 *     responses:
 *       200:
 *          description: interest calculation
 */
