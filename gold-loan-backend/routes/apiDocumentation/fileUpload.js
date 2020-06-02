
/**
* @swagger
* /upload-file:
*   get:
*     tags:
*       - FileUpload
*     name: file-upload 
*     summary: To read file-upload 
*     security:
*       - bearerAuth: [] 
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Success
*       404:
*         description: Data not found
*   post:
*     tags:
*       - FileUpload
*     name: file-upload
*     summary: To add File Upload
*     security:
*       - bearerAuth: []
*     consumes:
*       - multipart/form-data
*     parameters:
*       - name: avatar
*         in: formData
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