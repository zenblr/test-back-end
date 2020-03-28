/**
 * @swagger
 * /city/{stateId}:
 *   get:
 *     tags:
 *       - city
 *     summary: To read city by Id
 *     parameters:
 *     - name: stateId
 *       in: "path"
 *       description: "ID of city to return"
 *       required: true
 *       type: integer
 *     security:
 *       - bearerAuth: [] 
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: success. 
 *       500:    
 *         description: Internal server error..
 * /city:
 *   post:
 *     tags:
 *       - city
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
 *         description: Cities Csv is already Uploaded
 */