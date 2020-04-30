/**
 * @swagger
 * /partner-branch:
 *   post:
 *     tags:
 *       - Branch
 *     name: branch
 *     summary: To add branch
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
 *             partnerId:
 *               type: number
 *             cityId:
 *               type: number
 *             stateId:
 *               type: number
 *             address:
 *               type: string
 *             pinCode:
 *               type: number
 *         required:
 *           - name
 *           - partnerId
 *           - cityId
 *           - stateId
 *           - address
 *           - pinCode
 *     responses:
 *       201:
 *          description: branch created
 *       400:
 *          description: Invalid pincode
 *   get:
 *     tags:
 *       - Branch
 *     name: read branch
 *     summary: To read branch with pagination
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
 *          description: data not found
 *   delete:
 *     tags:
 *       - Branch
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of branch to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: "Value of isActive of branch to delete"
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
 *         description: branch deleted failed.
 *
 * /branch/{id}:
 *   get:
 *     tags:
 *       - Branch
 *     name: read branch
 *     summary: To read branch by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "ID of branch to return"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Data found
 *       404:
 *         description: Data not found
 *
 *   put:
 *     tags:
 *       - Branch
 *     summary: To update branch
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of branch to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             partnerId:
 *               type: number
 *             cityId:
 *               type: number
 *             stateId:
 *               type: number
 *             address:
 *               type: string
 *             pinCode:
 *               type: number
 *         required:
 *           - name
 *           - partnerId
 *           - cityId
 *           - stateId
 *           - addresss
 *           - pinCode
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Update failed
 */