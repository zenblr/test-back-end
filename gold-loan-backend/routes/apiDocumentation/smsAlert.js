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
 *             alertFor:
 *               type: string
 *             content:
 *               type: string
 *         required:
 *           - alertFor
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
 *        - application/json
 *     parameters:
 *     - name: "search"
 *       in: "query"
 *       description: "search your keyword"
 *       type: "string"
 *     - name: "from"
 *       in: "query"
 *       description: "Pagination starting point"
 *       type: "string"
 *     - name: "to"
 *       in: "query"
 *       description: "Pagination ending point"
 *       type: "string"
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: data not found
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
 *             content:
 *               type: string
 *         required:
 *           - content
 *     responses:
 *       200:
 *         description: updated
 *       404:
 *         description: sms alert not Updated
 */
