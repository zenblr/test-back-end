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
 *       500:
 *          description: Internal server error
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
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: Data not found
 *   delete:
 *     tags:
 *       - Stage
 *     summary: To delete by Id
 *     parameters:
 *     - name: "stageId"
 *       in: "query"
 *       description: "Id of status to delete"
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
