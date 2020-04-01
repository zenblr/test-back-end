/**
 * @swagger
 * /status:
 *   post:
 *     tags:
 *       - Status
 *     name: status
 *     summary: To add status
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
 *             statusName:
 *               type: string
 *         required:
 *           - statusName
 *     responses:
 *       200:
 *          description: Status Created 
 *       404:
 *          description: This Status is already Exist
 *       500:
 *          description: Internal server error
 *   get:
 *     tags:
 *       - Status
 *     name: read status
 *     summary: To read status
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     responses:
 *       200:
 *          description: Success
 *       500:
 *          description: Internal server error
 *   delete:
 *     tags:
 *       - Status
 *     summary: To delete by Id
 *     parameters:
 *     - name: "statusId"
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
