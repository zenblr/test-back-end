
/**
* @swagger
* /offer:
*   get:
*     tags:
*       - Offer
*     name: Read Offer
*     summary: To read Offer
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
*       - Offer
*     summary: To add Offer
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
*                type: string 
*         required:
*           - images
*     responses:
*       201:
*         description: Offer added
*       422:
*         description: Offer not added
*       200:
*         description: Success
*       404:
*         description: Data not Updated
 
*/