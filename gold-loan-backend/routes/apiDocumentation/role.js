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
 *             description:
 *               type: string
 *             permissionId:
 *               type: integer
 *         required:
 *           - roleName
 *           - description
 *           - permissionId
 *     responses:
 *       201:
 *         description: role created
 *       404:
 *         description: This Role is already Exist
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
 *   delete:
 *     tags:
 *       - Role
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of role to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: "isActive of role to delete"
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
 *         description: update failed.
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
 *             description:
 *               type: string
 *             permissionId:
 *               type: string 
 *     required:
 *         - roleName
 *         - description
 *         - permissionId
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: This Role is already Exist
 * 
 */