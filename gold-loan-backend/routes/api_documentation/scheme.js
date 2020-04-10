/**
 * @swagger
 * /customer:
 *   post:
 *     tags:
 *       - Scheme
 *     name: add Scheme
 *     summary: To add Scheme
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
 *             schemeAmountStart:
 *               type: number
 *             schemeAmountEnd:
 *               type: number
 *             interestRateThirtyDaysMonthly:
 *               type: number
 *             interestRateSixtyDaysMonthly:
 *               type: number
 *             interestRateNinetyDaysMonthly:
 *               type: number
 *             interestRateThirtyDaysAnnually:
 *               type: number
 *             interestRateSixtyDaysAnnually:
 *               type: number  
 *             interestRateNinetyDaysAnnually:
 *               type: number
 *             partnerId:
 *               type: number
 *         required:
 *           - schemeAmountStart
 *           - schemeAmountEnd
 *           - interestRateThirtyDaysMonthly
 *           - interestRateSixtyDaysMonthly
 *           - interestRateNinetyDaysMonthly
 *           - interestRateThirtyDaysAnnually
 *           - interestRateSixtyDaysAnnually
 *           - interestRateNinetyDaysAnnually
 *           - partnerId
 *     responses:
 *       201:
 *          description: schemes Created
 *       500:
 *          description: Something went wrong/Internal server error
 *   get:
 *     tags:
 *       - Scheme
 *     name: read scheme
 *     summary: To read scheme 
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: data not found
 * /{id}:
 *   put:
 *     tags:
 *       - Scheme
 *     name: update scheme
 *     summary: To update scheme
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of Partner to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             schemeAmountStart:
 *               type: number
 *             schemeAmountEnd:
 *               type: number
 *             interestRateThirtyDaysMonthly:
 *               type: number
 *             interestRateSixtyDaysMonthly:
 *               type: number
 *             interestRateNinetyDaysMonthly:
 *               type: number
 *             interestRateThirtyDaysAnnually:
 *               type: number
 *             interestRateSixtyDaysAnnually:
 *               type: number  
 *             interestRateNinetyDaysAnnually:
 *               type: number
 *             partnerId:
 *               type: number
 *         required:
 *           - schemeAmountStart
 *           - schemeAmountEnd
 *           - interestRateThirtyDaysMonthly
 *           - interestRateSixtyDaysMonthly
 *           - interestRateNinetyDaysMonthly
 *           - interestRateThirtyDaysAnnually
 *           - interestRateSixtyDaysAnnually
 *           - interestRateNinetyDaysAnnually
 *           - partnerId
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: data not found
 *   delete:
 *     tags:
 *       - Scheme
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "Id of scheme to delete"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: data not found
 *   get:
 *     tags:
 *       - Scheme
 *     summary: To read by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "Id of scheme to read"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: data not found
 */