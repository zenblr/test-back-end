/**
 * @swagger
 * /role:
 *   post:
 *     tags:
 *       - Role
 *     name: role
 *     summary: To  add role
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
 *             roleName:
 *               type: string
 *         required:
 *           - role
 *     responses:
 *       201:
 *         description: role created
 *       422:
 *         description: role not created
 *   get:
 *     tags:
 *       - Role
 *     name: role
 *     summary: To read role
  *     security:
 *       - bearerAuth: []
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: data not found
 * /role/{id}:
 *   put:
 *     tags:
 *       - Role
 *     summary: To update role
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of role to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             roleName:
 *               type: string
 *     required:
 *         - roleName
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: data not found
 *   delete:
 *     tags:
 *       - Role
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "Id of role to delete"
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
 * 
 */