/**
 * @swagger
 * /occupation:
 *   post:
 *     tags:
 *       - Occupation
 *     name: Occupation
 *     summary: To add occupation
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
 *          description: Occupation Created
 *       400:
 *          description: This Occupation is already Exist
 *       422:
 *          description: Occupation is not created
 *   get:
 *     tags:
 *       - Occupation
 *     name: read partner
 *     summary: To read occupation
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
 *       - Occupation
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of occupations to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: "value of isActive of occupation to delete"
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
 *         description: Occupation deleted failed.
 * /occupation/{id}:
 *   put:
 *     tags:
 *       - Occupation
 *     summary: To update occupation
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of occupation to update"
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
 *         description: Occupation updated failed
 *       400:
 *         description: This Occupation is already Exist
 */
