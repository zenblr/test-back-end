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
 *             roleId:
 *               type: integer
 *             moduleId:
 *               type: array
 *               items:
 *                type:integer
 *         required:
 *           - roleName
 *           - description
 *           - roleId
 *           - moduleId
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
 * /role/all-role:
 *   get:
 *     tags:
 *       - Role
 *     name: role
 *     summary: To read all role
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
 *             description:
 *               type: string
 *     required:
 *         - roleName
 *         - description
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: This Role is already Exist
 * 
 */