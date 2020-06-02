/**
 * @swagger
 * /holiday-master:
 *   post:
 *     tags:
 *       - Holiday Master
 *     name: add holiday master
 *     summary: To add holiday master
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
 *             holidayDate:
 *               type: string
 *             description:
 *               type: string
 *             year:
 *               type: integer
 *         required:
 *           - holidayDate
 *           - description
 *           - year
 *     responses:
 *       201:
 *          description: holiday date is  created
 *       400:
 *          description: This holiday date is already Exist
 *   get:
 *     tags:
 *       - Holiday Master
 *     name: read holiday master
 *     summary: To read holiday master with pagination
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
 *   delete:
 *     tags:
 *       - Holiday Master
 *     summary: To delete holiday master by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of holiday master to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: " value of isActive of holiday master to delete"
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
 *         description: holiday master deleted failed.
 * /holiday-master/{id}:
 *   get:
 *     tags:
 *       - Holiday Master
 *     name: read holiday master 
 *     summary: To read holiday master by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "ID of holiday master to return"
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
 *       - Holiday Master
 *     summary: To update holiday master
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of holiday master to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             holidayDate:
 *               type: string
 *             description:
 *               type: string
 *             year:
 *               type: integer
 *         required:
 *           - holidayDate
 *           - description
 *           - year
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: holiday master updated failed
 *       400:
 *         description: This holiday date is already Exist
 */
