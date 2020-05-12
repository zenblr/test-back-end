/**
 * @swagger
 * /scheme:
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
 *             schemeName:
 *               type: string
 *             schemeAmountStart:
 *               type: number
 *             schemeAmountEnd:
 *               type: number
 *             interestRateThirtyDaysMonthly:
 *               type: number
 *             interestRateNinetyDaysMonthly:
 *               type: number
 *             interestRateOneHundredEightyDaysMonthly:
 *               type: number
 *             interestRateThirtyDaysAnnually:
 *               type: number
 *             interestRateNinetyDaysAnnually:
 *               type: number  
 *             interestRateOneHundredEightyDaysAnnually:
 *               type: number
 *             partnerId:
 *               type: number
 *         required:
 *           - schemeName
 *           - schemeAmountStart
 *           - schemeAmountEnd
 *           - interestRateThirtyDaysMonthly
 *           - interestRateNinetyDaysMonthly
 *           - interestRateOneHundredEightyDaysMonthly
 *           - interestRateThirtyDaysAnnually
 *           - interestRateNinetyDaysAnnually
 *           - interestRateOneHundredEightyDaysAnnually
 *           - partnerId
 *     responses:
 *       201:
 *          description: schemes created
 *       400:
 *          description: interest Rate required/ partnerId is required/start amount is required/end amount is required/ internal branch name is already exist
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
 *   delete:
 *     tags:
 *       - Scheme
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of scheme to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: "isActive of scheme to delete"
 *       required: true
 *       type: "boolean"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: data not found
 * /scheme/{id}:
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
 *             schemeName:
 *               type: string
 *             schemeAmountStart:
 *               type: number
 *             schemeAmountEnd:
 *               type: number
 *             interestRateThirtyDaysMonthly:
 *               type: number
 *             interestRateNinetyDaysMonthly:
 *               type: number
 *             interestRateOneHundredEightyDaysMonthly:
 *               type: number
 *             interestRateThirtyDaysAnnually:
 *               type: number
 *             interestRateNinetyDaysAnnually:
 *               type: number  
 *             interestRateOneHundredEightyDaysAnnually:
 *               type: number
 *             partnerId:
 *               type: number
 *         required:
 *           - schemeName
 *           - schemeAmountStart
 *           - schemeAmountEnd
 *           - interestRateThirtyDaysMonthly
 *           - interestRateNinetyDaysMonthly
 *           - interestRateOneHundredEightyDaysMonthly
 *           - interestRateThirtyDaysAnnually
 *           - interestRateNinetyDaysAnnually
 *           - interestRateOneHundredEightyDaysAnnually
 *           - partnerId
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: data not found
 *       400:
 *          description: interest Rate required/ partnerId is required/start amount is required/end amount is required
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