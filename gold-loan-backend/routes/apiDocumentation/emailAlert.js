/**
 * @swagger
 * /email-alert:
 *   post:
 *     tags:
 *       - Email Alert
 *     name: add email alert
 *     summary: To add email alert
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
 *             variable:
 *               type: string
 *             subjecLine:
 *               type: string
 *             content:
 *               type: string
 *         required:
 *           - event
 *           - variable
 *           - subjectLine
 *           - content
 *     responses:
 *       201:
 *          description: email alert created
 *       422:
 *          description: email alert is not created
 *   get:
 *     tags:
 *       - Email Alert
 *     name: read email alert
 *     summary: To read email alert
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
 *       - Email Alert
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of email alert to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: " value of isActive of email to delete"
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
 *         description: email alert deleted failed.
 * /email-alert/{id}:
 *   get:
 *     tags:
 *       - Email Alert
 *     name: read email alert
 *     summary: To read email alert by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "ID of Email to return"
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
 *       - Email Alert
 *     name: update email alert
 *     summary: To update email alert
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of email alert to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             event:
 *               type: string
 *             variable:
 *               type: string
 *             subjectLine:
 *               type: string
 *             content:
 *               type: string
 *         required:
 *           - event
 *           - variable
 *           - subjectLine
 *           - content
 *     responses:
 *       200:
 *         description: updated
 *       404:
 *         description: email alert not Updated
 */
