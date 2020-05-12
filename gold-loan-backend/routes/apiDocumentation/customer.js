/**
 * @swagger
 * /customer/send-register-otp:
 *   post:
 *     tags:
 *       - Customer Registration
 *     name: add Customer by mobile otp
 *     summary: To add customer by  mobile otp
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
 *             mobileNumber:
 *               type: string
 *         required:
 *           - mobileNumber
 *     responses:
 *       200:
 *         description: Otp send to your entered mobile number.
 *       404:
 *         description: Mobile number is not Exist.
 * /customer/send-otp:
 *   post:
 *     tags:
 *       - Customer Registration
 *     name: add Customer by otp
 *     summary: To add customer by otp
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
 *             mobileNumber:
 *               type: number
 *         required:
 *           - mobileNumber
 *     responses:
 *       200:
 *         description: Otp send to your entered mobile number.
 *       404:
 *         description: Mobile number is not Exist.
 * /customer/verify-otp:
 *   post:
 *     tags:
 *       - Customer Registration
 *     name: verify by otp
 *     summary: To verify by otp
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
 *             referenceCode:
 *               type: string
 *             otp:
 *               type: number
 *         required:
 *           - referenceCode
 *           - otp
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Invalid otp.
 *
 * /customer:
 *   post:
 *     tags:
 *       - Customer Registration
 *     name: add Customer
 *     summary: To add customer 
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
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             referenceCode:
 *               type: string
 *             panCardNumber:
 *               type: string
 *             internalBranchId:
 *               type: number
 *             cityId:
 *               type: number
 *             stateId:
 *               type: number  
 *             address:
 *               type: array
 *               items:
 *                type: object
 *                properties:
 *                 address:
 *                   type: string
 *                 landMark:
 *                   type: string
 *                 stateId:
 *                   type: number
 *                 cityId:
 *                   type: number
 *                 pinCode: 
 *                   type: number
 *             statusId:
 *               type: number  
 *         required:
 *           - firstName
 *           - lastName
 *           - referenceCode
 *           - panCardNumber
 *           - address
 *           - stateId
 *           - cityId
 *           - address
 *           - statusId
 *     responses:
 *       200:
 *          description: Customer Created
 *       404:
 *          description: This Mobile number is already Exist/Registration Failed
 *   get:
 *     tags:
 *       - Customer Registration
 *     name: read customer
 *     summary: To read customer with pagination
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "search"
 *       in: "query"
 *       description: "search your keyword"
 *       type: "string"
 *     - name: "from"
 *       in: "query"
 *       description: "Pagination starting point"
 *       type: "string"
 *     - name: "to"
 *       in: "query"
 *       description: "Pagination ending point"
 *       type: "string"
 *     - name: "stageName"
 *       in: "query"
 *       type: "string"
 *       required: true
 *     responses:
 *       200:
 *          description: Success
 *       500:
 *          description: Internal server error
 *   delete:
 *     tags:
 *       - Customer Registration
 *     summary: To delete by Id
 *     parameters:
 *     - name: "customerId"
 *       in: "query"
 *       description: "Id of customer to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: "isActive customer to delete"
 *       required: true
 *       type: "boolean"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Updated.
 *       404:
 *         description: Customer is not exist
 * /customer/{customerId}:
 *   get:
 *     tags:
 *       - Customer Registration
 *     summary: To read by Id
 *     parameters:
 *     - name: "customerId"
 *       in: "path"
 *       description: "Id of customer to read"
 *       required: true
 *       type: integer
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Customer not found    
 *   put:
 *     tags:
 *       - Customer Registration
 *     name: update customer
 *     summary: To update customer
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of customer to update"
 *         required: true
 *         type: integer
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *                 stateId:
 *                   type: number
 *                 cityId:
 *                   type: number 
 *                 pinCode:
 *                   type: integer
 *                 internalBranchId:
 *                   type: number
 *         required:
 *           - cityId
 *           - stateId
 *           - pinCode
 *           - internalBranchId
 *     responses:
 *       200:
 *          description: User Updated
 *       404:
 *          description: Customer is not exist
 */