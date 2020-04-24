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
 *   get:
 *     tags:
 *       - Status
 *     name: read status
 *     summary: To read status
 *     parameters:
 *     - name: "getAll"
 *       in: "query"
 *       description: "isActive to get"
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
 *       - Status
 *     summary: To delete by Id
 *     parameters:
 *     - name: "statusId"
 *       in: "query"
 *       description: "Id of status to delete"
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
 *         description: status deleted failed.
 * /status/{id}:
 *   put:
 *     tags:
 *       - Status
 *     summary: To update status
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of status to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             statusName:
 *               type: string
 *     required:
 *         - statusName
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: This Status is already Exist
 */
