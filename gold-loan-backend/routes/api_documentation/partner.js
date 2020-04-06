/**
 * @swagger
 * /partner:
 *   post:
 *     tags:
 *       - Partner
 *     name: partner
 *     summary: To add partner
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
 *             name:
 *               type: string
 *             commission:
 *               type: number
 *         required:
 *           - name
 *           - commission
 *     responses:
 *       201:
 *          description: partner created
 *       500:
 *          description: Something went wrong
 *   get:
 *     tags:
 *       - Partner
 *     name: read partner
 *     summary: To read partner with pagination
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
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
 *          description: Data not found
 *
 * /partner/{id}:
 *   get:
 *     tags:
 *       - Partner
 *     name: Read partner
 *     summary: To read partner by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "ID of partner to return"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Data found
 *       404:
 *         description: Data not found
 *
 *   put:
 *     tags:
 *       - Partner
 *     summary: To update partner
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of Partner to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             commission:
 *               type: number
 *         required:
 *           - name
 *           - commission
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: data not found
 *   delete:
 *     tags:
 *       - Partner
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "Id of partner to delete"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: data not found.
 */
