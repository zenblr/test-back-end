/**
* @swagger
* /digital-gold/customer-kyc:
*   post:
*     tags:
*       - Customer Kyc
*     name: To Add Customer Kyc details
*     summary: To add customer Kyc details
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
*             panNumber:
*               type: string
*             panAttachment:
*               type: string
*             aadharNumber:
*               type: string
*             aadharAttachment:
*               type: string
*         required:
*           - panNumber
*           - panAttachment
*   get:
*     tags:
*       - Customer Kyc
*     name: Read customer Kyc details
*     summary: To read customer kyc details
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Customer kyc Does Not Exists
*/