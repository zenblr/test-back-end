/**
 * @swagger
 * /scrap/scrap-process/customer-scrap-details/{customerUniqueId}:
 *   get:
 *     tags:
 *       - Customer scrap Process
 *     summary: To read customer scrap details by customer unique Id
 *     parameters:
 *     - name: "customerUniqueId"
 *       in: "path"
 *       description: "Id of customer Unique Id to read"
 *       required: true
 *       type: string
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
 * /scrap/scrap-process/basic-details:
 *   post:
 *     tags:
 *       -  Customer scrap Process
 *     name: add basic details for scrap
 *     summary: To add basic details for scrap
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
 *             scrapId:
 *               type: integer
 *             customerId:
 *               type: integer
 *             customerUniqueId:
 *               type: string
 *             kycStatus:
 *               type: string
 *             startDate:
 *               type: string
 *         required:
 *           - scrapId
 *           - customerId
 *           - customerUniqueId
 *           - kycStatus
 *           - startDate
 *     responses:
 *       200:
 *         description: Basic details added successfully
 *       404:
 *         description: Data not found.
 * /scrap/scrap-process/acknowledgement-details:
 *   post:
 *     tags:
 *       -  Customer scrap Process
 *     name: add acknowledgement details for scrap
 *     summary: To add acknowledgement details for scrap
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
 *             scrapId:
 *               type: integer
 *             approxPurityReading:
 *               type: integer
 *             xrfMachineReadingImage:
 *               type: string
 *             customerConfirmation:
 *               type: string
 *         required:
 *           - scrapId
 *           - approxPurityReading
 *           - xrfMachineReadingImage
 *           - customerConfirmation
 *     responses:
 *       200:
 *         description: acknowledgement details added successfully
 *       404:
 *         description: Data not found.
 * /scrap/scrap-process/bank-details:
 *   post:
 *     tags:
 *       -  Customer scrap Process
 *     name: add bank details for scrap
 *     summary: To add bank details for scrap
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
 *             scrapId:
 *               type: integer
 *             paymentType:
 *               type: string
 *             bankName:
 *               type: string
 *             accountNumber:
 *               type: string
 *             ifscCode:
 *               type: string
 *             bankBranchName:
 *               type: string
 *             accountHolderName:
 *               type: string
 *             passbookProof:
 *               type: string
 *         required:
 *           - scrapId
 *           - paymentType
 *           - bankName
 *           - accountNumber
 *           - ifscCode
 *           - bankBranchName
 *           - accountHolderName
 *     responses:
 *       200:
 *         description: bank details added successfully
 *       404:
 *         description: Data not found.
 * /scrap/scrap-process/appraiser-rating:
 *   post:
 *     tags:
 *       -  Customer scrap Process
 *     name: appraiser rating for scrap
 *     summary: To give appraiser rating for scrap
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
 *             scrapId:
 *               type: integer
 *             applicationFormForAppraiser:
 *               type: string
 *             goldValuationForAppraiser:
 *               type: string
 *             scrapStatusForAppraiser:
 *               type: string
 *             commentByAppraiser:
 *               type: string
 *         required:
 *           - scrapId
 *           - applicationFormForAppraiser
 *           - goldValuationForAppraiser
 *           - scrapStatusForAppraiser
 *           - commentByAppraiser
 *     responses:
 *       200:
 *         description: appraiser rating added successfully
 *       404:
 *         description: Data not found.
 */