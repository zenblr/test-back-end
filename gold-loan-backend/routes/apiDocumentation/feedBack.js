/**
 * @swagger
 * /customer-feedback:
 *   post:
 *     tags:
 *       - Customer FeedBack
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
 *       201:
 *          description:  created
 *       422:
 *          description: feedback is not created
 *   get:
 *     tags:
 *       - Customer FeedBack
 *     name: read customer feedback
 *     summary: To read customer feedback
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: data not found
 *   delete:
 *     tags:
 *       - Customer FeedBack
 *     summary: To delete customer feedback by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of customer feedback to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: " value of isAcive of customer feedback to delete"
 *       required: true
 *       type: "boolean"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Updated.
 *       404:
 *         description: feedback deleted failed.
 * /customer-feedback/{id}:
 *   get:
 *     tags:
 *       - Customer FeedBack
 *     name: read customer feedback
 *     summary: To read customer feedback by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "ID of customer feedback to return"
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
 *   put:
 *     tags:
 *       - Customer FeedBack
 *     name: update customer feedback
 *     summary: To update customer feedback
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of customer feedback to update"
 *         required: true
 *         type: "integer"
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
 *         description: updated
 *       404:
 *         description: update failed
 */
