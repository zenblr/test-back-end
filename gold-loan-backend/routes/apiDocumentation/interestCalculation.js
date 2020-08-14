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
 */
