/**
 * @swagger
 * /global-setting:
 *   post:
 *     tags:
 *       - Global Settings
 *     name: Global Settings
 *     summary: To add global settings
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
 *             ltvGoldValue:
 *               type: string
 *             minimumLoanAmountAllowed:
 *               type: string
 *             minimumTopUpAmount:
 *               type: string
 *             gracePeriodDays:
 *               type: string
 *             cashTransactionLimit:
 *               type: string
 *             gst:
 *               type: string
 *         required:
 *           - ltvGoldValue
 *           - minimumLoanAmountAllowed
 *           - minimumTopUpAmount
 *           - gracePeriodDays
 *           - cashTransactionLimit
 *     responses:
 *       200:
 *          description: success
 *   get:
 *     tags:
 *       - Global Settings
 *     name: read global settings
 *     summary: To read global settings
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: Data not found
 */
