/**
 * @swagger
 * /city:
 *   get:
 *     tags:
 *       - City
 *     summary: To read city by Id
 *     parameters:
 *     - name: "stateId"
 *       in: "query"
 *       description: "ID of city to return"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: [] 
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: success.
 *   post:
 *     tags:
 *       - City
 *     summary: To post city csv file
 *     security:
 *       - bearerAuth: []  
 *     consumes:
 *       - multipart/form-data       
 *     parameters:
 *       - name: csv
 *         in: body
 *         type: file
 *         schema:
 *           type: objectsearch your keyword
 *           properties:
 *             csv:
 *               type: file
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: city Csv is already Uploaded
 */