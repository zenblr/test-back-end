/**
 * @swagger
 * /address-proof-type:
 *   post:
 *     tags:
 *       - Address Proof Type
 *     name: add address proof type
 *     summary: To add address proof type
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
 *          description: Address Proof Type is  created
 *       422:
 *          description: Address Proof Type is not created
 *   get:
 *     tags:
 *       - Address Proof Type
 *     name: read address proof type
 *     summary: To read address proof type
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
 *       - Address Proof Type
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of address proof type to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: " value of isActive of address proof type to delete"
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
 *         description: Address Proof Type  deleted failed
 */
