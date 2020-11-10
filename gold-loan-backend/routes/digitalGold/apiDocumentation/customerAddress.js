/**
* @swagger
* /digital-gold/customer-address:
*   post:
*     tags:
*       - Customer Address
*     name: To Add Customer Address
*     summary: To add customer Address
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
*             email:
*               type: string
*             name:
*               type: string
*             cityId:
*               type: string
*             stateId:
*               type: string
*             pincode:
*               type: string
*             address:
*               type: string
*             mobileNumber:
*               type: string
*         required:
*           - email
*           - name
*           - cityID
*           - stateID
*           - pincode
*           - address
*           - mobileNumber
*   get:
*     tags:
*       - Customer Address
*     name: Read customer address
*     summary: To read customer address
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Customer Does Not Exists
* /digital-gold/customer-address/{userAddressId}:
*   put:
*     tags:
*       - Customer Address
*     summary: To update customer address
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     parameters:
*       - name: "userAddressId"
*         in: "path"
*         description: "address id of user "
*         type: "integer"
*         required:
*           - userAddressId
*     responses:
*       200:
*         description: packet updated successfully
*       404:
*         description: packet not updated
*/