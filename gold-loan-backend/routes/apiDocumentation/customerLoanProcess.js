/**
 * @swagger
 * /loan-process/loan-date-change:
 *   post:
 *     tags:
 *       - Customer Loan Process
 *     summary: TO CHANGE LOAN DATES (date= YYYY/MM/DD)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             loanUniqueId:
 *               type: string
 *             loanStartDate:
 *               type: string
 *     responses:
 *       200:
 *          description: date chanes success
 *       400:
 *          description: failed
 * 
 * /loan-process/customer-loan-details/{customerUniqueId}:
 *   get:
 *     tags:
 *       - Customer Loan Process
 *     summary: To read customer loan details by customer unique Id
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
 * 
 * /loan-process/check-loan-type:
 *   post:
 *     tags:
 *       - Customer Loan Process
 *     summary: To get loan type
 *     parameters:
 *     - name: body
 *       in: body
 *       description: "To check the loan type"
 *       required: true
 *       schema:
 *          type: object
 *          properties:
 *           loanAmount:
 *              type: string 
 *           securedSchemeId:
 *              type: string
 *           fullAmount:
 *              type: string
 *           partnerId:
 *              type: string
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: customer details fetch successfully.
 *       
 * 
 * /loan-process/apply-for-loan:
 *   post:
 *     tags:
 *       -  Customer Loan Process
 *     name: apply for loan application
 *     summary: To apply for loan application
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
 *             customerId:
 *               type: integer
 *             totalEligibleAmt:
 *               type: number
 *             totalFinalInterestAmt:
 *               type: number
 *             loanBank:
 *               type: object
 *               properties:
 *                 bankName:
 *                   type: string
 *                 accountNumber:
 *                   type: string
 *                 ifscCode:
 *                   type: string
 *             loanApproval:
 *                type: object
 *                properties:
 *                   applicationFormForAppraiser:
 *                     type: boolean
 *                   goldValuationForAppraiser:
 *                     type: boolean
 *                   loanStatusForAppraiser:
 *                     type: string
 *                     enum:
 *                      - pending
 *                      - approved
 *                   commentByAppraiser:
 *                     type: string
 *                   applicationFormForBM:
 *                     type: boolean
 *                   goldValutionForBM:
 *                     type: boolean
 *                   loanStatusForBM:
 *                     type: string
 *                     enum:
 *                      - pending
 *                      - approved
 *                   commentByBM:
 *                     type: string
 *             loanFinalCalculator:
 *                type: object
 *                properties:
 *                   partnerId:
 *                    type: integer
 *                   schemeId:
 *                    type: integer
 *                   finalLoanAmount:
 *                    type: number
 *                   loanStartDate:
 *                    type: string
 *                   tenure:
 *                     type: integer
 *                   loanEndDate:
 *                     type: string
 *                   paymentFrequency:
 *                     type: string
 *                   processingCharge:
 *                     type: number
 *                   interestRate:
 *                     type: number
 *             loanKyc:
 *               type: object
 *               properties:
 *                identityTypeId:
 *                 type: integer
 *                identityProof:
 *                 type: array
 *                 items:
 *                  type: string
 *                idCardNumber:
 *                 type: string
 *                permentAddressProofTypeId:
 *                 type: integer
 *                permanentAddress:
 *                 type: string
 *                permanentAddStateId:
 *                 type: integer
 *                permanentAddCityId:
 *                 type: integer
 *                permanentAddPin:
 *                 type: number
 *                permanentAddProofId:
 *                 type: integer
 *                permanentAddProof:
 *                 type: array
 *                 items:
 *                  type: string
 *                permanentAddCardNumber:
 *                 type: number
 *                residentialAddProofTypeId:
 *                 type: integer
 *                residentialAddress:
 *                 type: string
 *                residentialAddStateId:
 *                 type: integer
 *                residentialAddCityId:
 *                 type: integer
 *                residentialAddPin:
 *                 type: integer
 *                residentialAddProof:
 *                 type: array
 *                 items:
 *                  type: string
 *                residentialAddCardNumber:
 *                 type: string
 *             loanNominee:
 *               type: object
 *               properties:  
 *                 nomineeName:
 *                  type: string
 *                 nomineeAge:
 *                  type: integer
 *                 relationship:
 *                  type: string
 *                 nomineeType:
 *                  type: string
 *                  enum:
 *                   - minor
 *                   - major
 *                 guardianName:
 *                   type: string
 *                 guardianAge:
 *                   type: integer
 *                 guardianRelationship:
 *                   type: string
 *             loanOrnmanets:
 *               type: array
 *               items:
 *                type: object
 *                properties:
 *                 ornamentType:
 *                   type: string
 *                 quantity:
 *                   type: string
 *                 grossWeight:
 *                   type: string
 *                 netWeight:
 *                   type: string
 *                 deductionWeight:
 *                   type: string
 *                 ornamentImage:
 *                   type: string
 *                 weightMachineZeroWeight:
 *                   type: string
 *                 withOrnamentWeight:
 *                   type: string
 *                 stoneTouch:
 *                   type: string
 *                 acidTest:
 *                   type: string
 *                 karat:
 *                    type: string
 *                 purity:
 *                    type: string
 *                 purityTest:
 *                   type: array
 *                   items: 
 *                    type: string
 *                 ltvRange:
 *                   type: array
 *                   items: 
 *                     type: string
 *                 ltvPercent:
 *                    type: string
 *                 ltvAmount:
 *                    type: number
 *                 currentLtvAmount:
 *                    type: number
 *             loanPersonal:
 *               type: object
 *               properties:
 *                customerUniqueId:
 *                 type: string
 *                mobileNumber:
 *                 type: string
 *                panCardNumber:
 *                 type: string
 *                startDate:
 *                 type: string
 *     required:
 *       - customerId
 *       - totalEligibleAmt
 *       - totalFinalInterestAmt
 *       - loanApproval
 *       - loanBank
 *       - loanOrnmanets
 *       - loanFinalCalculator
 *       - loanPersonal
 *       - loanKyc
 *       - loanNominee
 *     responses:
 *       201:
 *         description: you have successfully applied for the loan.
 *       400:
 *         description: customer Kyc status is not approved
 * /loan-process/add-packet-images:
 *   post:
 *     tags:
 *       -  Customer Loan Process
 *     name: add package images for loan
 *     summary: To add package image for loan
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
 *             loanId:
 *               type: integer
 *             packageImageData:
 *               type: array
 *               items:
 *                type: object
 *                properties:
 *                 emptyPacketWithNoOrnament:
 *                   type: string
 *                 packetWithAllOrnaments:
 *                   type: string
 *                 packetWithSealing:
 *                   type: string
 *                 packetWithWeight:
 *                   type: string
 *                 packetId:
 *                   type: integer
 *         required:
 *           - loanId
 *           - packageImageData
 *     responses:
 *       200:
 *         description: Packets added successfully
 *       400:
 *         description: Packets has been already assign
 *       404:
 *         description: iven loan id is not proper.
 * /loan-process/disbursement-of-loan:
 *   post:
 *     tags:
 *       -  Customer Loan Process
 *     name: distbusrsement of loan amount
 *     summary: To distbursement of loan amount
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
 *             loanId:
 *               type: integer
 *             transcationId:
 *               type: integer
 *             date:
 *               type: string
 *         required:
 *           - loanId
 *           - transcationId
 *           - date
 *     responses:
 *       200:
 *         description: you loan amount has been disbursed successfully
 *       404:
 *         description: Given loan id is not proper.
 * /loan-process/loan-details:
 *   get:
 *     tags:
 *       -  Customer Loan Process
 *     name: read loan details
 *     summary: To read loan details
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
 *          description: Loan details fetch successfully
 *       404:
 *          description: no loan details found
 * /loan-process/applied-loan-details:
 *   get:
 *     tags:
 *       -  Customer Loan Process
 *     name: read loan details
 *     summary: To read loan details
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
 *          description: Loan details fetch successfully
 *       404:
 *          description: no loan details found
 * /loan-process/single-loan:
 *   get:
 *     tags: 
 *       -  Customer Loan Process
 *     name: read loan details
 *     summary: To read loan details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "customerLoanId"
 *       in: "query"
 *       description: "Id of customer loan Id"
 *       type: "string"
 *       required: true
 *     responses:
 *       200:
 *          description: success.
 * /loan-process/change-loan-detail/{loanId}:
 *   put:
 *     tags:
 *       - Customer Loan Process
 *     name: update customer ornament detail
 *     summary: To update customer ornament detail
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "loanId"
 *         in: "path"
 *         description: "Id of loan process to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             totalEligibleAmt:
 *               type: number
 *             totalFinalInterestAmt:
 *               type: number
 *             loanFinalCalculator:
 *               type: object
 *               properties:
 *                partnerId:
 *                  type: integer
 *                schemeId:
 *                  type: integer
 *                finalLoanAmount:
 *                  type: number
 *                loanStartDate:
 *                  type: string
 *                tenure:
 *                  type: integer
 *                loanEnDate:
 *                  type: string
 *                paymentFrequency:
 *                  type: string
 *                processingCharge:
 *                  type: string
 *                interestRate:
 *                  type: string
 *             loanNominee:
 *               type: object
 *               properties:
 *                nomineeName:
 *                  type: string
 *                nomineeAge:
 *                  type: integer
 *                relationship:
 *                  type: string
 *                nomineeType:
 *                  type: string
 *                  enum:
 *                   - minor
 *                   - major
 *                guardianName:
 *                  type: string
 *                guardianAge:
 *                  type: integer
 *                guardianRelationship:
 *                  type: string
 *             loanApproval:
 *               type: object
 *               properties:
 *                applicationFormForAppraiser:
 *                 type: boolean
 *                goldValuationForAppraiser:
 *                 type: boolean    
 *                loanStatusForAppraiser:
 *                 type: string
 *                 enum:
 *                  - pending
 *                  - approved
 *                commentByAppraiser: 
 *                 type: string   
 *                applicationFormForBM:
 *                 type: boolean
 *                goldValuationForBM:
 *                 type: boolean
 *                loanStatusForBM:
 *                 type: string
 *                 enum:
 *                  - pending
 *                  - approved
 *                commentByBM:
 *                 type: string
 *             loanOrnmanets:
 *              type: object
 *              properties:
 *               ornamentType:
 *                type: string
 *               quantity:
 *                type: string
 *               grossWeight:
 *                type: string
 *               netWeight:
 *                type: string
 *               dedcuctionWeight:
 *                type: string
 *               ornamentImage:
 *                type: string
 *               weightMachineZeroWeight:
 *                type: string 
 *               withOranmentWeight:
 *                type: string
 *               stoneTouch:
 *                type: string 
 *               acidTest:
 *                type: string
 *               karat:
 *                type: string
 *               purity:
 *                type: string
 *               ltvRange:
 *                type: array
 *                items:
 *                 type: string
 *               purityTest:
 *                type: array
 *                items: 
 *                 type: string
 *               ltvPercent:
 *                type: string
 *               ltvAmount:
 *                type: number
 *               loanAmount:
 *                type: string
 *               finalNetWeight:
 *                type: string
 *               currentLtvAmount:
 *                type: number
 *     required:
 *      - totalEligibleAmt
 *      - totalFinalInterestAmt
 *      - loanApproval
 *      - loanOrnmanets
 *      - loanFinalCalculator
 *      - loanNominee
 *     responses:
 *       200:
 *          description: success
 * /loan-process/get-print-details:
 *   get:
 *     tags: 
 *       -  Customer Loan Process
 *     name: print loan details
 *     summary: To print loan details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "customerLoanId"
 *       in: "query"
 *       description: "Id of customer loan Id"
 *       type: "string"
 *       required: true
 *     responses:
 *       200:
 *          description: success.
 */