
/**
* @swagger
* /banner/readbanner:
*   get:
*     tags:
*       - Banner
*     name: Read Banner
*     summary: To read Banners
*     consumes:
*       - application/json
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: Data found 
*       404:
*         description: Data not found
* /banner/addbanner:
*   post:
*     tags:
*       - Banner
*     summary: To add Banners
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
*             userId: 
*               type:integer 
*             images:
*               type: array
*               items: 
*                type:string 
*         required:
*           - images
*     responses:
*       201:
*         description: Banner added
*       422:
*         description: Banner not added
*       200:
*         description: Banner updated
*       404:
*         description: Data not found
* /banner/deletebanner/{id}:
*   delete:
*     tags:
*       - Banner
*     summary: To delete by Id
*     parameters:
*     - name: "bannerId"
*       in: "path"
*       description: "Id of banner to delete"
*       required: true
*       type: "integer"
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Success.
*       404:
*         description: Data not found.
 
*/