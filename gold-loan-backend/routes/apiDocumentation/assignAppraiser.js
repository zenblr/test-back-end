/**
 * @swagger
 * /assign-appraiser:
 *   post:
 *     tags:
 *       - Assign Appraiser
 *     name: add appraiser
 *     summary: To add assign appraiser
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
 *             customerUniqueId:
 *               type: string
 *             appraiserId:
 *               type: integer
 *             customerId:
 *               type: integer
 *         required:
 *           - customerUniqueId
 *           - appraiserId
 *           - customerId
 *     responses:
 *       200:
 *          description: success
 *   get:
 *     tags:
 *       - Assign Appraiser
 *     name: read assign appraiser
 *     summary: To read assign appraiser
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
 *          description: success
 *       404:
 *          description: data not found
  * /assign-appraiser/{id}:
 *   get:
 *     tags:
 *       - Assign Appraiser
 *     name: read assign appraiser
 *     summary: To assign appraiser
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "ID of assign appraiser to return"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *   put:
 *     tags:
 *       - Assign Appraiser
 *     name: update assign appraiser
 *     summary: To update assign appraiser
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of assign appraiser to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             appraiserId:
 *               type: integer
 *         required:
 *           - appraiserId
 *     responses:
 *       200:
 *         description: success
 */
