/**
 * @swagger
 * /permission:
 *   post:
 *     tags:
 *       - Permission
 *     name: permission
 *     summary: To  add permission
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
 *             permissionName:
 *               type: string
 *         required:
 *           - role
 *     responses:
 *       201:
 *         description: permission created
 *       422:
 *         description: permission not created
 *   get:
 *     tags:
 *       - Permission
 *     name: permission
 *     summary: To read permission
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: data not found
 * /permission/{id}:
 *   put:
 *     tags:
 *       - Permission 
 *     name: permission
 *     summary: To update permission
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of permission to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             permissionName:
 *               type: string
 *     required:
 *         - permissionName
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: data not found
 *   delete:
 *     tags:
 *       - Permission
 *     name: permission
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "Id of permission to delete"
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