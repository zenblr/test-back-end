
/**
* @swagger
* /lender-banner:
*   get:
*     tags:
*       - Lender Banner
*     name: Read Lender Banner
*     summary: To read lender banner
*     consumes:
*       - application/json
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: Success
*       404:
*         description: Data not found
*   post:
*     tags:
*       - Lender Banner
*     summary: To add lender banner
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
*             images:
*               type: array
*               items: 
*                type:string 
*         required:
*           - images
*     responses:
*       201:
*         description: Lender Banner  added
*       422:
*         description: Lender Banner not added
*       200:
*         description: Success
*       404:
*         description: Data not Updated
 
*/