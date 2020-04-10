
/**
* @swagger
* /upload-file:
*   get:
*     tags:
*       - File-Upload
*     name: file-upload APIs
*     summary: To read file-upload 
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
*       - File-Upload
*     summary: api for File Upload
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
*             avatar:
*               type: file
*     responses:
*       200:
*         description: fileupload
*       400:
*         description: Error while uploading file
*/