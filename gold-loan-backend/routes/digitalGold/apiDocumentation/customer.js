/**
* @swagger
* /digital-gold/customer:
*   post:
*     tags:
*       - Customer
*     name: To Add Customer
*     summary: To add customer
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
*             firstName:
*               type: string
*             lastName:
*               type: string
*             cityId:
*               type: string
*             stateId:
*               type: string
*             pinCode:
*               type: string
*             address:
*               type: string
*             referenceCode:
*               type: string
*         required:
*           - email
*           - userName
*           - cityID
*           - stateID
*           - pinCode
*           - address
*           - referenceCode
*   get:
*     tags:
*       - Customer
*     name: Read customer
*     summary: To read customer details
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
*   put:
*     tags:
*       - Customer
*     name: To Update Customer
*     summary: To update customer
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
*             firstName:
*               type: string
*             lastName:
*               type: string
*             cityId:
*               type: string
*             stateId:
*               type: string
*             pinCode:
*               type: string
*             address:
*               type: string
*             mobileNumber:
*               type: string
*             dateOfBirth:
*               type: string
*             nomineeName:
*               type: string
*             nomineeDateOfBirth:
*               type: string
*             nomineeRelation:
*               type: string
*         required:
*           - email
*           - userName
*           - cityID
*           - stateID
*           - pinCode
*           - address
*           - mobileNumber
*           - dateOfBirth
* /digital-gold/customer/passbook-details:
*   get:
*     tags:
*       - Customer
*     name: Read customer passbook details
*     summary: To read customer passbook details
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