
/**
* @swagger
* /upload-scheme:
*   post:
*     tags:
*       - Upload-Scheme
*     summary: api for Upload Scheme
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
*             schemecsv:
*               type: file
*             partnerId:
*               type: array
*               items:
*                types: integer
*     responses:
*       201:
*         description: Schemes Created
*       500:
*         description: Internal Server Error
*/