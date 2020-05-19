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
 *             partnerId:
 *               type: number
 *         required:
 *           - schemeName
 *           - schemeAmountStart
 *           - schemeAmountEnd
 *           - interestRateThirtyDaysMonthly
 *           - interestRateNinetyDaysMonthly
 *           - interestRateOneHundredEightyDaysMonthly
 *           - partnerId
 *     responses:
 *       201:
 *          description: schemes created
 *       400:
 *          description: This Scheme Name is already Exist /Your Scheme start amount is must be less  than your Scheme end amount
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
 * /scheme/filter-scheme:
 *   get:
 *     tags:
 *       - Scheme
 *     summary: To filter by is active
 *     parameters:
 *     - name: "isActive"
 *       in: "query"
 *       description: "isActive of scheme to filter"
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
 * 
 * /scheme/{id}:
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
 * /scheme/partner-scheme/{id}:
 *  get:
 *     tags:
 *       - Scheme
 *     summary: To read by Partner Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "Id of partner to read scheme"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 * 
 */