/**
 * @swagger
 * /stage:
 *   post:
 *     tags:
 *       - Stage
 *     name: stage
 *     summary: To add stage
 *     consumes:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             stageName:
 *               type: string
 *         required:
 *           - stageName
 *     responses:
 *       200:
 *          description: Stage Created 
 *       404:
 *          description: This Stage is already Exist
 *   get:
 *     tags:
 *       - Stage
 *     name: read stage
 *     summary: To read stage
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "getAll"
 *         in: "query"
 *         description: "isActive to get "
 *         required: true
 *         type: "boolean"
 *     responses:
 *       200:
 *          description: Success
 *   delete:
 *     tags:
 *       - Stage
 *     summary: To delete by Id
 *     parameters:
 *     - name: "stageId"
 *       in: "query"
 *       description: "Id of stage to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: "isActive to deactived"
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
 *         description: stage deleted failed.
 * /stage/{id}:
 *    put:
 *     tags:
 *       - Stage
 *     name: stage
 *     summary: To add stage
 *     consumes:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of stage to update"
 *         required: true
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             stageName:
 *               type: string
 *         required:
 *           - stageName
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: This Stage is already Exist/Data not updated
 */
