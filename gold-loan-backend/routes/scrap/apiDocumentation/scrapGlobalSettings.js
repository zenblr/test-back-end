/**
 * @swagger
 * /scrap/global-setting:
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
 *               type: number
 *             cashTransactionLimit:
 *               type: number
 *             processingChargesFixed:
 *               type: number
 *             processingChargesInPercent:
 *               type: number
 *             gst:
 *               type: number
 *         required:
 *           - ltvGoldValue
 *           - cashTransactionLimit
 *           - processingChargesFixed
 *           - processingChargesInPercent
 *           - gst
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
