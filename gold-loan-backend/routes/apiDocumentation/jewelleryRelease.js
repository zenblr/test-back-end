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
 * /jewellery-release/part-release:
 *   post:
 *     tags:
 *       - Jewellery Release
 *     name: Payment Confirmation of part release
 *     summary: Payment Confirmation of part release
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
 *             paymentType:
 *               type: string
 *             paidAmount:
 *               type: integer
 *             bankName:
 *               type: string
 *             branchName:
 *               type: string
 *             chequeNumber:
 *               type: string
 *             depositDate:
 *               type: string
 *             transactionId:
 *               type: string
 *             masterLoanId:
 *               type: integer
 *             releaseAmount:
 *               type: integer
 *             interestAmount:
 *               type: integer
 *             penalInterest:
 *               type: integer
 *             payableAmount:
 *               type: integer
 *             releaseGrossWeight:
 *               type: integer
 *             releaseDeductionWeight:
 *               type: integer
 *             releaseNetWeight:
 *               type: integer
 *             remainingGrossWeight:
 *               type: integer
 *             remainingDeductionWeight:
 *               type: integer
 *             remainingNetWeight:
 *               type: integer
 *             currentLtv:
 *               type: integer
 *             ornamentId:
 *               type: array
 *               items:
 *                 type: integer
 *     responses:
 *       200:
 *          description: release amount and details
 *       400:
 *          description: failed
 *   get:
 *     tags:
 *       - Jewellery Release
 *     name: read part release list
 *     summary: To read part release list
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "search"
 *       in: "query"
 *       description: "search your keyword"
 *       type: "string"
 *     - name: "from"
 *       in: "query"
 *       description: "Pagination starting point"
 *       type: "string"
 *     - name: "to"
 *       in: "query"
 *       description: "Pagination ending point"
 *       type: "string"
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: Data not found
 * /jewellery-release/amount-status:
 *   put:
 *     tags:
 *       - Jewellery Release
 *     name: Part release update amount status
 *     summary: Part release update amount status
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
 *             amountStatus:
 *               type: string
 *             partReleaseId:
 *               type: integer
 *     responses:
 *       200:
 *          description: status updated
 *       400:
 *          description: failed
 * /jewellery-release/customer/{customerId}:
 *   get:
 *     tags:
 *       - Jewellery Release
 *     name: Read customer details
 *     summary: To read customer details
 *     parameters:
 *     - name: "customerId"
 *       in: "path"
 *       description: "customerId to get customer"
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
 * /jewellery-release/assign-appraiser:
 *   post:
 *     tags:
 *       - Jewellery Release
 *     name: Assign appraiser
 *     summary: Assign appraiser for part release process
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
 *             partReleaseId:
 *               type: integer
 *             appraiserId:
 *               type: integer
 *             customerId:
 *               type: integer
 *             appoinmentDate:
 *               type: string
 *             startTime:
 *               type: string
 *             endTime:
 *               type: string
 *     responses:
 *       200:
 *          description: success
 *       400:
 *          description: failed
 * /jewellery-release/update-appraiser:
 *   put:
 *     tags:
 *       - Jewellery Release
 *     name: Update appraiser
 *     summary: Update appraiser for part release process
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
 *             partReleaseId:
 *               type: integer
 *             appraiserId:
 *               type: integer
 *             customerId:
 *               type: integer
 *             appoinmentDate:
 *               type: string
 *             startTime:
 *               type: string
 *             endTime:
 *               type: string
 *     responses:
 *       200:
 *          description: success
 *       400:
 *          description: failed
 * /jewellery-release/part-release-approved_list:
 *   get:
 *     tags:
 *       - Jewellery Release
 *     name: read part release approved list
 *     summary: To read part release approved list
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "search"
 *       in: "query"
 *       description: "search your keyword"
 *       type: "string"
 *     - name: "from"
 *       in: "query"
 *       description: "Pagination starting point"
 *       type: "string"
 *     - name: "to"
 *       in: "query"
 *       description: "Pagination ending point"
 *       type: "string"
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: Data not found
 * /jewellery-release/appraiser-status:
 *   put:
 *     tags:
 *       - Jewellery Release
 *     name: Part release update appraiser status
 *     summary: Part release update appraiser status
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
 *             partReleaseStatus:
 *               type: string
 *             partReleaseId:
 *               type: integer
 *             appraiserReason:
 *               type: string
 *     responses:
 *       200:
 *          description: status updated
 *       400:
 *          description: failed
 * /jewellery-release/document:
 *   post:
 *     tags:
 *       - Jewellery Release
 *     name: Part release upload document
 *     summary: Part release upload document
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
 *             partReleaseId:
 *               type: integer
 *             documents:
 *               type: array
 *               items:
 *                 type: string
 *     responses:
 *       200:
 *          description: success
 *       400:
 *          description: failed
 * /jewellery-release/apply-loan/{customerUniqueId}:
 *   get:
 *     tags:
 *       - Jewellery Release
 *     summary: To read customer loan details by customer unique Id
 *     parameters:
 *     - name: "customerUniqueId"
 *       in: "path"
 *       description: "Id of customer Unique Id to read"
 *       required: true
 *       type: string
 *     - name: "partReleaseId"
 *       in: "query"
 *       description: "partReleaseId"
 *       type: "string"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: customer details fetch successfully.
 *       400:
 *         description: This customer Did not assign in to anyone/This customer is not assign to you
 *       404:
 *         description: no customer details found
 */


