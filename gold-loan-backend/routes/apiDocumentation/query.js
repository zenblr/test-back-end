/**
 * @swagger
 * /customer-query:
 *   post:
 *     tags:
 *       - Customer Query
 *     name: add customer query
 *     summary: To add customer query
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
 *             customerName:
 *               type: string
 *             contactNumber:
 *               type: number
 *             query:
 *               type: string
 *         required:
 *           - customerName
 *           - contactNumber
 *           - query
 *     responses:
 *       201:
 *          description:  created
 *       422:
 *          description: Query  is not created
 *   get:
 *     tags:
 *       - Customer Query
 *     name: read customer query
 *     summary: To read customer query
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
 *       - Customer Query
 *     summary: To delete customer query by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of customer query to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: " value of isActive of customer query to delete"
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
 *         description: Query deleted failed.
 * /customer-query/{id}:
 *   get:
 *     tags:
 *       - Customer Query
 *     name: read customer query
 *     summary: To read customer query by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "ID of customer query to return"
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
 *       - Customer Query
 *     name: update customer query
 *     summary: To update customer query
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of customer query to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *         required:
 *           - status
 *     responses:
 *       200:
 *         description: updated
 *       404:
 *         description: update failed
 */
