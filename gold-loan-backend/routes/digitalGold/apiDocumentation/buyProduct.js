/**
* @swagger
* /digital-gold/buy-metal:
*   post:
*     tags:
*       - Buy Gold/Silver
*     name: To buy gold/silver
*     summary: To buy gold/silver
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
*             amount:
*               type: number
*             metalType:
*               type: string
*             quantity:
*               type: number
*             lockPrice:
*               type: number
*             blockId:
*               type: string
*             quantityBased:
*               type: string
*             modeOfPayment:
*               type: string
*         required:
*           - amount
*           - metalType
*           - quantity
*           - lockPrice
*           - blockId
*           - quantityBased
*           - modeOfPayment
*   get:
*     tags:
*       - Buy Gold/Silver
*     name: To get customer buy list
*     summary: To get customer buy list
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
* /digital-gold/buy/buy-info/{transactionId}:
*   get:
*     tags:
*       - Buy Gold/Silver
*     name: To read buy details with transaction id
*     summary: To read buy details with transaction id
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     parameters:
*       - name: :"transactionId"
*         in: "path"
*         description: :"transactionId of bought gold/silver"
*         type: "string"
*         required:
*           - :transactionId
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
* /digital-gold/buy/generate-invoice/{transactionId}:
*   get:
*     tags:
*       - Buy Gold/Silver
*     name: To generate inovice
*     summary: To generate invoice
*     parameters:
*       - name: :"transactionId"
*         in: "path"
*         description: "transactionId of bought gold/silver"
*         type: "string"
*         required:
*           - :transactionId
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
*/