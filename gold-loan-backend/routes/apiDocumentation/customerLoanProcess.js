/**
 * @swagger
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
 *             name:
 *               type: string
 *             accountNumber:
 *               type: string
 *             ifscCode:
 *               type: string
 *             aadharNumber:
 *               type: string
 *             permanentAddress:
 *               type: string
 *             pincode:
 *               type: string
 *             officeAddress:
 *               type: string
 *             nomineeName:
 *               type: string
 *             nomineeAge:
 *               type: integer
 *             relationship:
 *               type: string
 *             ornamentData:
  *               type: array
 *               items:
 *                type: object
 *                properties:
 *                 ornamentType:
 *                   type: string
 *                 quantity:
 *                   type: string
 *                 grossWeight:
 *                   type: number
 *                 netWeight:
 *                   type: number
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
 *                 purityTest:
 *                   type: array
 *                   items: 
 *                    type: object
 *                 ltvPercent:
 *                    type: string
 *                 ltvAmount:
 *                    type: number
 *                 currentLtvAmount:
 *                    type: number
 *             customerUniqueId:
 *               type: integer
 *             mobile:
 *               type: string
 *             panCardNumber:
 *               type: string
 *             startDate:
 *               type: string
 *     responses:
 *       201:
 *         description: you have successfully applied for the loan.
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
 *               type: number
 *             packageImageData:
 *               type: string
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
 * loan-process/change-loan-ornaments-detail/{id}:
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
 *               type: string
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