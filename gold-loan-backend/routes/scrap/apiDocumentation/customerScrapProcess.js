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
 *             processingCharges:
 *               type: number
 *             standardDeduction:
 *               type: number
 *             customerConfirmationStatus:
 *               type: string
 *             customerConfirmation:
 *               type: array
 *               items:
 *                type: string
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
 * /scrap/scrap-process/ornaments-melting-details:
 *   post:
 *     tags:
 *       -  Customer scrap Process
 *     name: add ornaments melting details for scrap
 *     summary: To add ornaments melting details for scrap
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
 *             grossWeight:
 *               type: number
 *             netWeight:
 *               type: number
 *             deductionWeight:
 *               type: number
 *             karat:
 *               type: number
 *             purityReading:
 *               type: number
 *             customerConfirmation:
 *               type: string
 *             finalScrapAmountAfterMelting:
 *               type: number
 *             eligibleScrapAmount:
 *               type: number
 *             ornamentImageWithWeight:
 *               type: string
 *             ornamentImageWithXrfMachineReading:
 *               type: string
 *             ornamentImage:
 *               type: string
 *         required:
 *           - scrapId
 *           - grossWeight
 *           - netWeight
 *           - deductionWeight
 *           - karat
 *           - purityReading
 *           - finalScrapAmountAfterMelting
 *           - eligibleScrapAmount
 *           - ornamentImageWithWeight
 *           - ornamentImageWithXrfMachineReading
 *     responses:
 *       200:
 *         description: ornaments melting details added successfully
 *       404:
 *         description: Data not found.
 * /scrap/scrap-process/quick-pay:
 *   post:
 *     tags:
 *       -  Customer scrap Process
 *     name: quick pay to the customer
 *     summary: quick pay to the customer
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
 *             paymentMode:
 *               type: string
 *             bankName:
 *               type: string
 *             bankBranch:
 *               type: string
 *             transactionId:
 *               type: string
 *             chequeNumber:
 *               type: string
 *             depositAmount:
 *               type: number
 *             depositDate:
 *               type: string
 *         required:
 *           - scrapId
 *           - paymentMode
 *     responses:
 *       200:
 *         description: quickPayment done successfully
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
 *               type: array
 *               items:
 *                type: string
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
 *                   approxPurityReading:
 *                    type: number
 *                   ornamentImage:
 *                    type: string
 *                   ornamentImageWithWeight:
 *                    type: string
 *                   ornamentImageWithXrfMachineReading:
 *                    type: string
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
 * /scrap/scrap-process/add-packet-images:
 *   post:
 *     tags:
 *       -  Customer scrap Process
 *     name: add packet image for scrap
 *     summary: To add packet image for scrap
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
 *             emptyPacketWithNoOrnament:
 *               type: string
 *             sealingPacketWithWeight:
 *               type: string
 *             sealingPacketWithCustomer:
 *               type: string
 *             packetOrnamentArray:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                   packetId:
 *                    type: integer
 *                   packetName:
 *                    type: string
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
 *               type: array
 *               items:
 *                type: string
 *             purchaseInvoice:
 *               type: array
 *               items:
 *                type: string
 *             saleInvoice:
 *               type: array
 *               items:
 *                type: string
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
 * /scrap/scrap-process/applied-scrap-details:
 *   get:
 *     tags:
 *       -  Customer scrap Process
 *     name: read scrap details
 *     summary: To read scrap details
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
 *     - name: "appraiserApproval"
 *       in: "query"
 *       description: "appraiser approval"
 *       type: "string"
 *     - name: "scrapStageId"
 *       in: "query"
 *       description: "scrap stage id"
 *       type: "integer"
 *     responses:
 *       200:
 *          description: scrap details fetch successfully
 *       404:
 *          description: no scrap details found
 * /scrap/scrap-process/disbursement-bank-detail:
 *   get:
 *     tags:
 *       - Customer scrap Process
 *     summary: To read disbursement bank detail by customer scrap Id
 *     parameters:
 *     - name: "scrapId"
 *       in: "query"
 *       description: "Id of bank detail scrap Id to read"
 *       required: true
 *       type: string
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: bank detail fetch successfully.
 *       404:
 *         description: no bank detail found
 * /scrap/scrap-process/scrap-disbursement:
 *   post:
 *     tags:
 *       -  Customer scrap Process
 *     name:  add disbursement detail for scrap
 *     summary: To add disbursement detail for scrap
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
 *             scrapAmount:
 *               type: number
 *             transactionId:
 *               type: number
 *             date:
 *               type: string
 *             paymentMode:
 *               type: string
 *             accountHolderName:
 *               type: string
 *             accountNumber:
 *               type: string
 *             bankName:
 *               type: string
 *             bankBranchName:
 *               type: string
 *             ifscCode:
 *               type: string
 *             disbursementStatus:
 *               type: string
 *         required:
 *           - scrapId
 *           - scrapAmount
 *           - transactionId
 *           - date
 *           - paymentMode
 *           - acHolderName
 *           - acNumber
 *           - bankName
 *           - bankBranch
 *           - ifscCode
 *           - disbursementStatus
 *     responses:
 *       200:
 *         description: disbursement detail added successfully
 *       404:
 *         description: Data not found.
 * /scrap/scrap-process/scrap-details:
 *   get:
 *     tags:
 *       -  Customer scrap Process
 *     name: read scrap details
 *     summary: To read scrap details
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
 *          description: success.
 * /scrap/scrap-process/single-scrap-customer:
 *   get:
 *     tags:
 *       -  Customer scrap Process
 *     name: read single scrap details
 *     summary: To read single scrap details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "customerScrapId"
 *       in: "query"
 *       description: "Scrap Id"
 *       type: "number"
 *     responses:
 *       200:
 *          description: success.
 * /scrap/scrap-process/get-customer-acknowledgement:
 *   get:
 *     tags: 
 *       -  Customer scrap Process
 *     name: print customer acknowledgement
 *     summary: To print customer acknowledgement
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
 * /scrap/scrap-process/get-purchase-voucher:
 *   get:
 *     tags: 
 *       -  Customer scrap Process
 *     name: print purchase voucher
 *     summary: To print purchase voucher
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
 * /scrap/scrap-process/get-scrap-status:
 *   get:
 *     tags:
 *       - Customer scrap Process
 *     summary: To read all scrap status
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: bank detail fetch successfully.
 *       404:
 *         description: no bank detail found
 */