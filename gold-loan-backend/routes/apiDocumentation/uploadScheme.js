
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
*       - name: partnerId
*         in: formData
*         schema:
*           type: object
*           properties:
*             partnerId:
*              type: integer
*       - name: schemecsv
*         in: formData
*         type: file
*         schema:
*           type: objectsearch your keyword
*           properties:
*             schemecsv:
*               type: file
*     responses:
*       201:
*         description: Schemes Created
*       400:
*         description: Your Scheme start amount is must be greater than your Scheme end amount/Your file is empty.this scheme is already exist/In your csv file there scheme name is dublicate
*/