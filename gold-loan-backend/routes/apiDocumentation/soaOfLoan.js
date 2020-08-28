/**
 * @swagger
 * /loan-soa:
 *   post:
 *     tags:
 *       - SOA
 *     name: get loan SOA
 *     summary: Get loanSOA
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
 *             masterLoanId:
 *               type: integer
 *             startDate:
 *               type: string
 *             endDate:
 *               type: string
 *         required:
 *           - masterLoanId
 *           - startDate
 *           - endDate
 *     responses:
 *       200:
 *          description: loan soa
 *       404:
 *          description: no data found
 */
