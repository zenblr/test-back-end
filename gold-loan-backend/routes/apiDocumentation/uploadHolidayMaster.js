
/**
* @swagger
* /upload-holiday-master:
*   post:
*     tags:
*       - Upload Holiday Master
*     name: upload holiday master
*     summary: 
*     security:
*       - bearerAuth: []
*     consumes:
*       - multipart/form-data
*     parameters:
*       - name: holidaylist
*         in: formData
*         type: file
*         schema:
*           type: objectsearch your keyword
*           properties:
*             holidaylist:
*               type: file
*     responses:
*       200:
*         description: Holiday Master List Created
*       400:
*         description: In your csv file there holiday date is dublicate/this holiday date is already exist
*/