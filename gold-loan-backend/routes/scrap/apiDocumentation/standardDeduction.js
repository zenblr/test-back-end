/**
* @swagger
* /scrap/standard-deduction:
*   get:
*     tags:
*       - Standard deduction
*     name: Read standard deduction
*     summary: To read standard deduction with pagination
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
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
*   post:
*     tags:
*       - Standard deduction
*     summary: To add standard deduction
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
*             standardDeduction:
*               type: number
*     responses:
*       201:
*         description: standard deduction created
*       422:
*         description: standard deduction not created
* /scrap/standard-deduction/all-standard-deduction:
*   get:
*     tags:
*       - Standard deduction
*     name: Read standard deduction
*     summary: To read standard deduction without pagination
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
* /scrap/standard-deduction/{id}:
*   get:
*     tags:
*       - Standard deduction
*     name: Read standard deduction
*     summary: To read standard deduction by Id
*     parameters:
*     - name: "id"
*       in: "path"
*       description: "ID of standard deduction to return"
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
*   put:
*     tags:
*       - Standard deduction
*     summary: To update standard deduction
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     parameters:
*       - name: "id"
*         in: "path"
*         description: "Id of standard deduction to update"
*         required: true
*         type: "integer"
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             standardDeduction:
*               type: number
*     responses:
*       200:
*         description: standard deduction updated
*       404:
*         description: standard deduction you are updating does not exist
*   delete:
*     tags:
*       - Standard deduction
*     summary: To delete Standard deduction by Id
*     parameters:
*     - name: "id"
*       in: "path"
*       description: "Id of Standard deduction to delete"
*       required: true
*       type: "integer"
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Standard deduction deleted.
*       404:
*         description: The Sub-category does not exist.
*/