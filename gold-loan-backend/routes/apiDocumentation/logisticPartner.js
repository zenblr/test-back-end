/**
 * @swagger
 * /logistic-partner:
 *   post:
 *     tags:
 *       - Logistic Partner
 *     name: Logistic Partner
 *     summary: To add logistic partner
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
 *         required:
 *           - name
 *     responses:
 *       201:
 *          description: Logistic Partner Created
 *       400:
 *          description: This Logistic Partner is already Exist
 *       422:
 *          description: Logistic Partner is not created
 *   get:
 *     tags:
 *       - Logistic Partner
 *     name: read Logistic Partner
 *     summary: To read Logistic Partner
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
 *   delete:
 *     tags:
 *       - Logistic Partner
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of Logistic Partner to delete"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Updated.
 *       404:
 *         description: Logistic Partner deleted failed.
 * /logistic-partner/{id}:
 *   put:
 *     tags:
 *       - Logistic Partner
 *     summary: To update logistic partner
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of logistic partner to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *         required:
 *           - name
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: logistic partner updated failed
 *       400:
 *         description: This logistic partner is already Exist
 */
