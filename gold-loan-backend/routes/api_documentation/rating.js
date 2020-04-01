/**
 * @swagger
 * /rating:
 *   post:
 *     tags:
 *       - Rating
 *     name: rating
 *     summary: To add rating
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
 *             ratingName:
 *               type: string
 *             ratingPoint:
 *               type: number
 *         required:
 *           - ratingName
 *           - ratingPoint
 *     responses:
 *       200:
 *          description: rating created
 *       404:
 *          description: This Rating is already Exist
 *       500:
 *          description: Internal server error
 *   get:
 *     tags:
 *       - Rating
 *     name: read rating
 *     summary: To read rating
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: Data not found
 *   delete:
 *     tags:
 *       - Rating
 *     summary: To delete by Id
 *     parameters:
 *     - name: "ratingId"
 *       in: "query"
 *       description: "Id of rating to delete"
 *       required: false
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: "isActive to delete"
 *       required: false
 *       type: "boolean"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Updated.
 *       500:
 *         description: Internal server error.
 */
