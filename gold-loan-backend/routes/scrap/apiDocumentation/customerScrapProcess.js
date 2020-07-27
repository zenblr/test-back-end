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
 *             xrfMachineReading:
 *               type: string
 *             customerConfirmation:
 *               type: string
 *         required:
 *           - scrapId
 *           - approxPurityReading
 *           - xrfMachineReading
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
 * /scrap/scrap-process/ornaments-details:
 *   post:
 *     tags:
 *       -  Customer scrap Process
 *     name: add ornaments details for scrap
 *     summary: To add ornaments details for scrap
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
 *             finalScrapAmount:
 *               type: integer
 *             scrapOrnaments:
 *                type: array
 *                items:
 *                  type: object  
 *                  properties:
 *                   ornamentTypeId:
 *                    type: integer
 *                   quantity:
 *                    type: integer
 *                   grossWeight:
 *                    type: number
 *                   netWeight:
 *                    type: number
 *                   deductionWeight:
 *                    type: number
 *                   karat:
 *                    type: number
 *                   purity:
 *                    type: number
 *                   ornamentImage:
 *                    type: array
 *                    items: 
 *                     type: string
 *                   ornamentImageWithXrfMachineReading:
 *                    type: array
 *                    items: 
 *                     type: string
 *                   ltvAmount:
 *                    type: number
 *                   scrapAmount:
 *                    type: number
 *         required:
 *           - scrapId
 *           - finalScrapAmount
 *     responses:
 *       200:
 *         description: acknowledgement details added successfully
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
 * /scrap/scrap-process/bm-rating:
 *   post:
 *     tags:
 *       -  Customer scrap Process
 *     name: bm rating for scrap
 *     summary: To give bm rating for scrap
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
 *             applicationFormForBM:
 *               type: string
 *             goldValuationForBM:
 *               type: string
 *             scrapStatusForBM:
 *               type: string
 *             commentByBM:
 *               type: string
 *         required:
 *           - scrapId
 *           - applicationFormForBM
 *           - goldValuationForBM
 *           - scrapStatusForBM
 *           - commentByBM
 *     responses:
 *       200:
 *         description: bm rating added successfully
 *       404:
 *         description: Data not found.
 * /scrap/scrap-process/ops-rating:
 *   post:
 *     tags:
 *       -  Customer scrap Process
 *     name: Operational team rating for scrap
 *     summary: To give operational team rating for scrap
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
 *             applicationFormForOperatinalTeam:
 *               type: string
 *             goldValuationForOperatinalTeam:
 *               type: string
 *             scrapStatusForOperatinalTeam:
 *               type: string
 *             commentByOperatinalTeam:
 *               type: string
 *         required:
 *           - scrapId
 *           - applicationFormForOperatinalTeam
 *           - goldValuationForOperatinalTeam
 *           - scrapStatusForOperatinalTeam
 *           - commentByOperatinalTeam
 *     responses:
 *       200:
 *         description: operational team rating added successfully
 *       404:
 *         description: Data not found.
 * /scrap/scrap-process/scrap-documents:
 *   post:
 *     tags:
 *       -  Customer scrap Process
 *     name:  add documents for scrap
 *     summary: To add documents for scrap
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
 *             purchaseVoucher:
 *               type: string
 *             purchaseInvoice:
 *               type: string
 *             saleInvoice:
 *               type: string
 *         required:
 *           - scrapId
 *           - purchaseVoucher
 *           - purchaseInvoice
 *           - saleInvoice
 *     responses:
 *       200:
 *         description: ocuments added successfully
 *       404:
 *         description: Data not found.
 * /scrap/scrap-process/single-scrap:
 *   get:
 *     tags: 
 *       -  Customer scrap Process
 *     name: read loan details
 *     summary: To read scrap details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "scrapId"
 *       in: "query"
 *       description: "Id of customer scrap Id"
 *       type: "string"
 *       required: true
 *     responses:
 *       200:
 *          description: success.
 */