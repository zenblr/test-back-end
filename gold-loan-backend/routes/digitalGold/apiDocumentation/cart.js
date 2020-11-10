/**
* @swagger
* /digital-gold/cart:
*   post:
*     tags:
*       - Cart
*     name: To create cart 
*     summary: To create cart
*     consumes:
*       - application/x-www-form-urlencoded
*     parameters:
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             productSku:
*               type: string
*             productWeight:
*               type: string
*             productName:
*               type: string
*             amount:
*               type: string
*             productImage:
*               type: string
*             quantity:
*               type: string
*         required:
*           - productSku
*           - productWeight
*           - productName
*           - amount
*           - productImage
*           - quantity
*   get:
*     tags:
*       - Cart
*     name: Read Cart
*     summary: To read customer cart details
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
* /digital-gold/cart/cart-count:
*   get:
*     tags:
*       - Cart
*     name: Read Cart count
*     summary: To read customer cart count
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       404:
*         description: Data not found
*       200:
*         description: cartCount
* /digital-gold/cart/{productSku}:
*   put:
*     tags:
*       - Cart
*     name: To Update Cart Quantity
*     summary: To update cart quantity
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/x-www-form-urlencoded
*     parameters:
*       - name: :"productSku"
*         in: "path"
*         description: "productSku of product"
*         type: "string"
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             quantity:
*               type: integer
*         required:
*           - quantity
*   delete:
*     tags:
*       - Cart
*     name: To delete product from cart
*     summary: To delete product from cart
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/x-www-form-urlencoded
*     parameters:
*       - name: :"productSku"
*         in: "path"
*         description: "productSku of product"
*         type: "string"
*/