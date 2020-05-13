/**
 * @swagger
 * /kyc/get-customer-detail:
 *   post:
 *     tags:
 *       - Customer Kyc
 *     name: get customer details
 *     summary: To get customer details
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
 *             mobileNumber:
 *               type: string
 *         required:
 *           - mobileNumber
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Your Mobile number does not exist, please add lead first/Status confirm is not there in status table/Please proceed after confirming your lead stage status
 * /kyc/customer-info:
 *   post:
 *     tags:
 *       - Customer Kyc
 *     name: submit Customer Kyc info
 *     summary: To submit kyc info
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
 *             firstName:
 *               type: string
 *             lastName:
 *               tyoe: string
 *             mobileNumber:
 *               type: string
 *             panCardNumber:
 *               type: string
 *         required:
 *           - firstName
 *           - lastName
 *           - mobileNumber
 *           - panCardNumber
 *     responses:
 *       200:
 *         description: Success.
 *       
 * /kyc/customer-kyc-address:
 *   post:
 *     tags:
 *       - Customer Kyc
 *     name: submit customer kyc address
 *     summary: To submit customer kyc address
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
 *             customerKycId:
 *               type: integer
 *             identityTypeId:
 *               type: integer
 *             identityProof:
 *               type: array
 *               items: 
 *                type: string
 *             address:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                  address: 
 *                    type: string
 *                  addressProof:
 *                    type: array
 *                    items: 
 *                     type: string
 *                  addressType:
 *                    type: string
 *                    enum: 
 *                     - permanent
 *                     - residential
 *                  addressProofTypeId:
 *                    type: integer                     
 *                  cityId:
 *                    type: integer
 *                  pinCode:
 *                    type: integer
 *                  stateId:
 *                    type: integer 
 *         required:
 *           - customerId
 *           - customerKycId
 *           - identityTypeId
 *           - identityProof
 *           - address
 *     responses:
 *       200:
 *         description: Success.
 * /kyc/customer-kyc-personal:
 *   post:
 *     tags:
 *       - Customer Kyc
 *     name: submit customer kyc personal detail
 *     summary: To submit kyc personal detail
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
 *             customerKycId:
 *               type: integer
 *             profileImage:
 *               type: string
 *             dateoOfBirth:
 *               type: string
 *             alternateMobileNumber:
 *               type: string
 *             gender:
 *               type: string
 *               enum:
 *                 - m
 *                 - f
 *                 - o
 *             martialStatus:
 *               type: string
 *               enum:
 *                 - single
 *                 - married
 *                 - divorced
 *             identityType:
 *               type: integer
 *             occupationId:
 *               type: integer 
 *             spouseName:
 *               type: string
 *             signatureProof:
 *               type: string
 *         required:
 *           - customerId
 *           - customerKycId
 *           - profileImage
 *           - dateOfBirth
 *           - alternateMobileNumber
 *           - gender
 *           - martialStatus
 *           - occupationId
 *           - spouseName
 *           - sinagtureProof
 *     responses:
 *       200:
 *          description: Your alternate Mobile number is same as your previous Mobile number/Success
 *       404:
 *          description: Your alternate Mobile number is already exist
 * /kyc/customer-kyc-bank:
 *   post:
 *     tags:
 *       - Customer Kyc
 *     name: submit customer kyc detail
 *     summary: To submit customer kyc detail
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
 *             customerKycId:
 *               type: integer
 *             bankName:
 *               type: string
 *             bankBranchName:
 *               type: string
 *             accountType:
 *               type: string
 *               enum:
 *                - saving
 *                - current
 *             accountNumber:
 *               type: string
 *             accountHolderName:
 *               type: string
 *             ifscCode:
 *               type: string
 *             passbookProof:
 *               type: array
 *               items:
 *                type: string 
 *     required:
 *       - customerId
 *       - customerKycId
 *       - bankName
 *       - bankBranchName
 *       - accountType
 *       - accountNumber
 *       - accountHolderName
 *       - ifscCode
 *       - passBookProof
 *     responses:
 *       200:
 *          description: Success
 * /kyc/submit-all-kyc-info:
 *   post:
 *     tags:
 *       - Customer Kyc
 *     name: submit all kyc info
 *     summary: To submit all kyc info 
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
 *             customerKycId:
 *               type: integer
 *         required:
 *           - customerId
 *           - customerKycId
 *     responses:
 *       200:
 *          description: successful
 *       404:
 *          description: This customer kyc detailes is not filled. 
 */