/**
 * @swagger
 * /branch:
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
 *             pincode:
 *               type:number
 *             commission:
 *               type: number
 *         required:
 *           - name
 *           - partnerId
 *           - cityId
 *           - stateId
 *           - address
 *           - pincode
 *           - commission
 *     responses:
 *       200:
 *          description: branch created
 *       400:
 *          description: Something went wrong
 *       401:
 *          description: unauthorized
 *   get:
 *     tags:
 *       - Branch
 *     name: read branch
 *     summary: To read branch
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: Data not found
 *
 * /branch/{id}:
 *   get:
 *     tags:
 *       - Branch
 *     name: Read branch
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
 *             pincode:
 *               type: number
 *             commission:
 *               type: number
 *         required:
 *           - name
 *           - partnerId
 *           - cityId
 *           - stateId
 *           - addresss
 *           - pincode
 *           - commission
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: data not found
 *   delete:
 *     tags:
 *       - Branch
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "Id of branch to delete"
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
 */
