/**
* @swagger
* /digital-gold/redeem-order:
*   post:
*     tags:
*       - Redeem Order
*     name: To redeem gold/silver
*     summary: To To redeem gold/silver
*     consumes:
*       - application/x-www-form-urlencoded
*     security:
*       - bearerAuth: []
*     parameters:
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             userAddressId:
*               type: integer
*             modeOfPayment:
*               type: string
*             amount:
*               type: number
*           orderAddress:
*             type: array
*             items:
*               type: string
*           cartData:
*             type: array
*             items:
*               type: string
*             shippingCharges:
*               type: number
*             totalQuantity:
*               type: number
*             totalWeight:
*               type: number
*         required:
*           - userAddressId
*   get:
*     tags:
*       - Redeem Order
*     name: To get redeem order list
*     summary: To get redeem order list
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
* /digital-gold/redeem-order/order-info/{merchantTransactionId}:
*   get:
*     tags:
*       - Redeem Order
*     name: To read redeem order details with merchantTransactionId
*     summary: To read redeem order details with merchantTransactionId
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     parameters:
*       - name: :"merchantTransactionId"
*         in: "path"
*         description: :"merchantTransactionId of redeem order"
*         type: "string"
*         required:
*           - :merchantTransactionId
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
* /digital-gold/redeem-order/invoice/{transactionId}:
*   get:
*     tags:
*       - Redeem Order
*     name: To generate inovice
*     summary: To generate invoice
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     parameters:
*       - name: :"transactionId"
*         in: "path"
*         description: "transactionId of redeem order"
*         type: "string"
*         required:
*           - :transactionId
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
*/