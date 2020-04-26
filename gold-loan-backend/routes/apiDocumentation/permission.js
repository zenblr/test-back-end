/**
 * @swagger
 * /permission:
 *   post:
 *     tags:
 *       - Permission
 *     name: permission
 *     summary: To add permission
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
 *             description:
 *               type: string
 *         required:
 *           - permissionName
 *     responses:
 *       201:
 *         description: permission created
 *       404:
 *         description: This Permission is already Exist
 *       422:
 *         description: permission not created
 * /permission/{roleId}:
 *   get:
 *     tags:
 *       - Permission
 *     name: permission
 *     summary: To read all permission while first adding.
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *        - application/json
 *     parameters:
 *       - name: "roleId"
 *         in: "path"
 *         description: "roleId of role"
 *         required: true
 *         type: "integer"
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
 *     - name: "permissionId"
 *       in: "query"
 *       description: "Id of permission to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: "Id of permission to delete"
 *       required: true
 *       type: "boolean"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: permission deleted failed.
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
 *             description:
 *               type: string
 *     required:
 *         - permissionName
 *         - description
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: permission update failed/This Permission is already Exist
 * 
 */