/**
* @swagger
* /digital-gold/customer-bank:
*   post:
*     tags:
*       - Customer Bank
*     name: To Add Customer Bank details
*     summary: To add customer bank details
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
*             bankId:
*               type: string
*             branchName:
*               type: string
*             accountNumber:
*               type: string
*             accountName:
*               type: string
*             ifscCode:
*               type: string
*         required:
*           - bankId
*           - branchName
*           - accountNumber
*           - accountName
*           - ifscCode
*   get:
*     tags:
*       - Customer Bank
*     name: Read customer bank details
*     summary: To read customer bank details
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Customer Does Not Exists
* /digital-gold/customer-bank/{customerBankId}:
*   delete:
*     tags:
*       - Customer Bank
*     summary: To delete customer bank details
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     parameters:
*       - name: "customerBankId"
*         in: "path"
*         description: "customer bank id of customer"
*         type: "string"
*         required:
*           - userAddressId
*     responses:
*       200:
*         description: packet updated successfully
*       404:
*         description: packet not updated
*/