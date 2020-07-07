/**
 * @swagger
 * /loan-transfer:
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
 *               type: number
 *             kycStatus: 
 *               type: number
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
 */