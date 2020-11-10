/**
* @swagger
* /digital-gold/sell:
*   post:
*     tags:
*       - Sell Gold/Silver
*     name: To sell gold/silver
*     summary: To sell gold/silver
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/x-www-form-urlencoded
*     parameters:
*       - name: body
*         in: body
*         schema:
*           type: object
*           properties:
*             metalType:
*               type: string
*             quantity:
*               type: string
*             lockPrice:
*               type: string
*             blockId:
*               type: string
*             userBankId:
*               type: string
*         required:
*           - metalType
*           - quantity
*           - lockPrice
*           - blockId
*           - userBankId
*   get:
*     tags:
*       - Sell Gold/Silver
*     name: To get customer sell list
*     summary: To get customer sell list
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
* /digital-gold/sell/sell-info/{transactionId}:
*   get:
*     tags:
*       - Sell Gold/Silver
*     name: To read sell details with transaction id
*     summary: To read sell details with transaction id
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     parameters:
*       - name: :"transactionId"
*         in: "path"
*         description: "transactionId of sold gold/silver"
*         type: "string"
*         required:
*           - :transactionId
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
*/