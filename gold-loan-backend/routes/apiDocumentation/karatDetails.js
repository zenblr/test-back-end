/**
 * @swagger
 * /karat-details:
 *   post:
 *     tags:
 *       - Karat Details
 *     name: add karat details
 *     summary: To add karat details
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
 *             karat:
 *               type: number
 *             fromPercentage:
 *               type: number
 *             toPercentage:
 *               type: number
 *         required:
 *           - karat
 *           - fromPercentage
 *           - toPercentage
 *     responses:
 *       201:
 *          description: karat details is created
 *       400:
 *          description: from percentage should less than to percentage/karat is already exist
 *       422:
 *          description: karat details is not created
 *   get:
 *     tags:
 *       - Karat Details
 *     name: read karat details
 *     summary: To read karat details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *          description: Success
 *   delete:
 *     tags:
 *       - Karat Details
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of karat details to delete"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Updated.
 *       404:
 *         description: deleted failed
 * /karat-details/{id}:
 *   put:
 *     tags:
 *       - Karat Details
 *     summary: To update karat details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of karat details to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             karat:
 *               type: number
 *             fromPercentage:
 *               type: number
 *             toPercentage:
 *               type: number
 *         required:
 *           - karat
 *           - fromPercentage
 *           - toPercentage
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: karat details updated failed
 *       400:
 *         description: This karat is already Exist

 */
