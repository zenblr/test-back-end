/**
 * @swagger
 * /loan-process/customer-details/:customerId:
 *   get:
 *     tags:
 *       - Customer Loan Process
 *     summary: To read by Id
 *     parameters:
 *     - name: "customerId"
 *       in: "path"
 *       description: "Id of customer Unique Id to read"
 *       required: true
 *       type: integer
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
 *                     type: string
 *                   goldValuationForAppraiser:
 *                     type: string
 *                   loanStatusForAppraiser:
 *                     type: string
 *                   commentByAppraiser:
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
 *     responses:
 *       200:
 *         description: success.
 * /loan-process/add-package-images:
 *   post:
 *     tags:
 *       -  Customer Loan Process
 *     name: add package images for loan
 *     summary: To add package imaged for loan
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
 *                 packetUniqueId:
 *                   type: string
 *         required:
 *           - loanId
 *           - packageImageData
 *     responses:
 *       201:
 *         description: you have successfully uploaded package images
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
 *               type: number
 *             transcationId:
 *               type: number
 *             date:
 *               type: string
 *         required:
 *           - loanId
 *           - transcationId
 *           - date
 *     responses:
 *       201:
 *         description: you loan amount has been disbursed successfully
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
 *     responses:
 *       200:
 *          description: loan details fetch successfully
 *       404:
 *          description: no loan details found
 * /loan-process/change-loan-ornaments-detail/{id}:
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
 *       - name: "id"
 *         in: "path"
 *         description: "Id of loan process to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             ornamentType:
 *               type: string
 *             quantity:
 *               type: string
 *             grossWeight:
 *               type: string
 *             netWeight:
 *               type: string
 *             dedcuctionWeight:
 *               type: string
 *             weightMachineZeroWeight:
 *               type: string 
 *             withOranmentWeight:
 *               type: string
 *             stoneTouch:
 *               type: string 
 *             acidTest:
 *               type: string
 *             purityTest:
 *               type: array
 *               items: 
 *                type: string
 *             ornamentImage:
 *               type: string
 *             ltvPercent:
 *               type: string
 *             ltvAmount:
 *               type: string
 *             currentLtvAmount:
 *               type: string
 *         required:
 *           - ornamentType
 *           - quantity
 *           - grossWeight
 *           - netWeight
 *           - deductionWeight
 *           - weightMachineZeroWeight
 *           - stoneTouch
 *           - acidtest
 *           - purityTest
 *           - ornamentImage
 *           - ltvPercent
 *           - ltvAmount
 *           - currentLtvAmount
 *     responses:
 *       200:
 *          description: customer ornaments details changed successfully
 *       422:
 *          description: customer ornaments details not updated    
 */