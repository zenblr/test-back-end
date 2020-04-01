/**
 * @swagger
 * /state:
 *   get:
 *     tags:
 *       - State
 *     name: state-api
 *     summary: To read state
 *     security:
 *       - bearerAuth: [] 
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Internal server error.
 *   post:
 *     tags:
 *       - State
 *     summary: To post state csv file
 *     security:
 *       - bearerAuth: []  
 *     consumes:
 *       - multipart/form-data       
 *     parameters:
 *       - name: upfile
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
 *         description: State Csv is already Uploaded
 */