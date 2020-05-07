/**
 * @swagger
 * /sms-alert:
 *   post:
 *     tags:
 *       - Sms Alert
 *     name: add sms alert
 *     summary: To add sms alert
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
 *             event:
 *               type: string
 *             content:
 *               type: string
 *         required:
 *           - event
 *           - content
 *     responses:
 *       201:
 *          description: sms alert created
 *       422:
 *          description: sms alert is not created
 *   get:
 *     tags:
 *       - Sms Alert
 *     name: read sms alert
 *     summary: To read sms alert
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
 *       - Sms Alert
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of sms alert to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: " value of isAcive of sms to delete"
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
 *         description: sms alert deleted failed.
 * /sms-alert/{id}:
 *   get:
 *     tags:
 *       - Sms Alert
 *     name: read sms alert
 *     summary: To read sms alert by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "ID of sms to return"
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
 *       - Sms Alert
 *     name: update sms alert
 *     summary: To update sms alert
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of sms alert to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             event:
 *               type: string
 *             content:
 *               type: string
 *         required:
 *           - event
 *           - content
 *     responses:
 *       200:
 *         description: updated
 *       404:
 *         description: sms alert not Updated
 */
