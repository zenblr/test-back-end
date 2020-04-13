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
 *   get:
 *     tags:
 *       - Rating
 *     name: read rating
 *     summary: To read rating
 *     parameters:
 *     - name: "getAll"
 *       in: "query"
 *       description: "isActive to delete"
 *       required: true
 *       type: "boolean"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *          description: Success
 *   delete:
 *     tags:
 *       - Rating
 *     summary: To delete by Id
 *     parameters:
 *     - name: "ratingId"
 *       in: "query"
 *       description: "Id of rating to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: "isActive to delete"
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
 *         description: rating deleted failed.
 * 
 * /rating/{id}:
 *    put:
 *     tags:
 *       - Rating
 *     summary: To update Rating
 *     security:
 *       - bearerAuth: []  
 *     consumes:
 *       - application/json 
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of Rating to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             ratingName:
 *               type: string
 *             ratingPoint:
 *               type: integer
 *         required:
 *           - ratingName
 *           - ratingPoint
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category you are updating does not exit
 */
