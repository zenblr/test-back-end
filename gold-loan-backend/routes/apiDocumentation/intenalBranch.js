/**
 * @swagger
 * /internal-branch:
 *   post:
 *     tags:
 *       - Internal Branch
 *     name: add internal branch
 *     summary: To add internal branch
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
 *             address:
 *               type: string
 *             cityId:
 *               type: number
 *             stateId:
 *               type: number
 *             pinCode:
 *               type: number
 *         required:
 *           - name
 *           - address
 *           - cityId
 *           - stateId
 *           - pinCode
 *     responses:
 *       201:
 *          description: internal branch created
 *       400:
 *          description: This intenal branch name is already Exist
 *   get:
 *     tags:
 *       - Internal Branch
 *     name: read internal branch
 *     summary: To read internal branch with pagination
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
 *          description: Data not found
 *   delete:
 *     tags:
 *       - Internal Branch
 *     summary: To delete internal branch by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of internal branch to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: " value of isActive of internal branch to delete"
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
 *         description: internal branch deleted failed.
 * /internal-branch/{id}:
 *   get:
 *     tags:
 *       - Internal Branch
 *     name: Read internal branch
 *     summary: To read internal branch by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "ID of internal branch to return"
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
 *       - Internal Branch
 *     summary: To update internal branch
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of internal branch to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             cityId:
 *               type: number
 *             stateId:
 *               type: number
 *             pinCode:
 *               type: number
 *             address:
 *               type: string
 *         required:
 *           - name
 *           - cityId
 *           - stateId
 *           - pinCode
 *           - address
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: Data not Updated
 *       400:
 *         description: This internal branch name is already Exist
 */
