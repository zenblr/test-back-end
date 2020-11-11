/**
* @swagger
* /digital-gold/product:
*   get:
*     tags:
*       - Product
*     name: To get product list
*     summary: To get product list
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
* /digital-gold/product/{productSku}:
*   get:
*     tags:
*       - Product
*     name: To read product details with productSku
*     summary: To read product details with productSku
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     parameters:
*       - name: :"productSku"
*         in: "path"
*         description: "productSku of product"
*         type: "string"
*         required:
*           - :productSku
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
*/