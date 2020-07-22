/**
 * @swagger
 * /jewellery-release/{masterLoanId}:
 *   get:
 *     tags:
 *       - Jewellery Relese
 *     name: Read ornament details
 *     summary: To read ornaments details by masterLoanId
 *     parameters:
 *     - name: "masterLoanId"
 *       in: "path"
 *       description: "masterLoanId to get ornaments"
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
 */
