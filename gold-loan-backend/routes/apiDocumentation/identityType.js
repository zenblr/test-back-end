/**
 * @swagger
 * /identity-type:
 *   post:
 *     tags:
 *       - Identity Type
 *     name: Identity Type
 *     summary: To add identity type
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
 *          description: Identity Type is created
 *       400:
 *          description: This Identity Type  is already Exist
 *       422:
 *          description: Identity Type is not created
 *   get:
 *     tags:
 *       - Identity Type
 *     name: read identity Type
 *     summary: To read identity type
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: Data not found
 *   delete:
 *     tags:
 *       - Identity Type
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of identity type to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: " value of isActive of identity type to delete"
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
 *         description: Identity type deleted failed.
 * /identity-type/{id}:
 *   put:
 *     tags:
 *       - Identity Type
 *     summary: To update identity type
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of identity type to update"
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
 *         description: identity type  update failed
 *       400:
 *         description: This identity type is already Exist
 */
