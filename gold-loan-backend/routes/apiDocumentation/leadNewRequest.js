/**
 * @swagger
 * /lead-new-request:
 *   post:
 *     tags:
 *       - New Request
 *     name: New Request
 *     summary: To add new request
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
 *             customerId:
 *               type: integer
 *             moduleId:
 *               type: integer
 *         required:
 *           - customerId
 *           - moduleId
 *     responses:
 *       201:
 *          description: Request Created
 *       400:
 *          description: This Lead Request already Exists
 * /lead-new-request/{id}:
 *   put:
 *     tags:
 *       - New Request
 *     summary: To update new request
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of request to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             moduleId:
 *               type: integer
 *         required:
 *           - moduleId
 *     responses:
 *       200:
 *          description: Request updated
 * /lead-new-request/view-all:
 *   get:
 *     tags:
 *       - New Request
 *     summary: To read the New Request(s)
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
 *         description: Fetched all request successfully
 *       404:
 *         description: Data not found
 * /lead-new-request/assign-appraiser/{id}: 
 *   put:
 *     tags: 
 *       - New Request
 *     summary: To assign appraiser
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of request to update assigned appraiser"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             appraiserId:
 *               type: integer
 *         required:
 *           - appraiserId
 *     responses:
 *       200:
 *          description: success.
 * /lead-new-request/my-request:
 *   get:
 *     tags:
 *       - New Request
 *     summary: To read the Assigned Request(s)
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
 *         description: Fetched all request successfully
 *       404:
 *         description: Data not found
 */