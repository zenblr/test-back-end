/**
 * @swagger
 * /jewellery-release/{masterLoanId}:
 *   get:
 *     tags:
 *       - Jewellery Release
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
 * /jewellery-release:
 *   post:
 *     tags:
 *       - Jewellery Release
 *     name: To get release amount and details
 *     summary: To get release amount
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
 *             ornamentId:
 *               type: array
 *               items:
 *                 type: integer
 *         required:
 *           - masterLoanId
 *           - ornamentId
 *     responses:
 *       200:
 *          description: release amount and details
 *       400:
 *          description: failed
 */
