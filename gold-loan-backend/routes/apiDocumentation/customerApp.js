/**
 * @swagger
 * /customer/banner:
 *   get:
 *     tags:
 *       - Customer App
 *     name: read banner
 *     summary: To read banner
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found.
 * /customer/offer:
 *   get:
 *     tags:
 *       - Customer App
 *     name: read offer
 *     summary: To read offer
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found.
 * /customer/lender-banner:
 *   get:
 *     tags:
 *       - Customer App
 *     name: read lender banner
 *     summary: To read lender banner
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found.
 * /customer/gold-rate:
 *   get:
 *     tags:
 *       - Customer App
 *     name: read gold rate
 *     summary: To read gold rate
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found.
 * /customer/personal-detail:
 *   get:
 *     tags:
 *       - Customer App
 *     name: read personal details
 *     summary: To read personal details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found.
 * /customer/bank-detail:
 *   get:
 *     tags:
 *       - Customer App
 *     name: read bank details
 *     summary: To read bank details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found.
 * /customer/nominee-detail:
 *   get:
 *     tags:
 *       - Customer App
 *     name: read nominee details
 *     summary: To read nominee details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found. 
 * /customer/address-detail:
 *   get:
 *     tags:
 *       - Customer App
 *     name: read address details
 *     summary: To read address details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found.
 * /customer/pan-card-image-detail:
 *   get:
 *     tags:
 *       - Customer App
 *     name: read pan card image
 *     summary: To read pan card image
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found.
 * /customer/address-proof-image-detail:
 *   get:
 *     tags:
 *       - Customer App
 *     name: read address image
 *     summary: To read address image
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found.
 * /customer/partner-branch/{id}:
 *   get:
 *     tags:
 *       - Customer App
 *     name: read partner branch
 *     summary: To read  partner branch by  city id
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *      - name: "id"
 *        in: "path"
 *        description: "Id of city to read"
 *        required: true
 *        type: integer
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found.
 * /customer/get-all-scheme:
 *   get:
 *     tags:
 *       - Customer App
 *     name: read all scheme
 *     summary: To read all scheme
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found.
 * /customer/scheme-based-on-price:
 *  get:
 *     tags:
 *       - Customer App
 *     name: read scheme based on price
 *     summary: To read scheme based on price
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "schemeAmountStart"
 *       in: "query"
 *       description: "enter schemeAmountStart"
 *       type: "number"
 *     - name: "schemeAmountStart"
 *       in: "query"
 *       description: "enter schemeAmountStart"
 *       type: "number"
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found.
 * /customer/customer-feedback:
 *   get:
 *     tags:
 *       - Customer App
 *     name: read customer feedback
 *     summary: To read customer feedback
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Data not found.
 *   post:
 *     tags:
 *       - Customer App
 *     name: add customer feedback
 *     summary: To add customer feedback
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
 *             customerName:
 *               type: string
 *             contactNumber:
 *               type: number
 *             feedBack:
 *               type: string
 *             rating:
 *               type: number
 *         required:
 *           - customerName
 *           - contactNumber
 *           - feedBack
 *           - rating
 *     responses:
 *       200:
 *         description: created.
 *       422:
 *         description: feedback is not created.
 */