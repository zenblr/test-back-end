/**
 * @swagger
 * /classification:
 *   put:
 *     tags:
 *       - Customer Classification
 *     name: update customer classification
 *     summary: To update customer classification
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
 *         description: success
 *       400:
 *         description: Cce rating not verified/You do not have authority.
 * /classification/cce:
 *   post:
 *     tags:
 *       - Customer Classification
 *     name: add customer classification
 *     summary: To add customer classification
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
 *             behaviourRatingCce:
 *               type: integer
 *             idProofRatingCce:
 *               type: integer
 *             addressProofRatingCce:
 *               type: integer
 *             kycStatusFromCce:
 *               type: string
 *               enum: 
 *                 - pending
 *                 - approved
 *             reasonFromCce:
 *               type: string
 *             behaviourRatingVerifiedByBm:
 *               type: boolean
 *             idProofRatingVerifiedByBm:
 *               type: boolean
 *             addressProofRatingVerifiedBm:
 *               type: boolean
 *             kycStatusFromBm:
 *               type: string
 *               enum: 
 *                 - pending
 *                 - approved
 *             reasonFromBm:
 *               type: string
 *         required:
 *           - customerId
 *           - customerKycId
 *           - bhaviourRatingCce
 *           - idProofRatingCce
 *           - addressProofRatingCce
 *           - kycStatusFromCce
 *           - behaviourRatingVerifiedByBm
 *           - idProofRatingVerifiedByBm
 *           - addressProofRatingVerifiedBm
 *           - kycStatusFromBm
 *     responses:
 *       200:
 *          description: success
 *       400:
 *          description: If you are not approved the customer kyc you have to give a reason/This customer rating is already exist
 */
