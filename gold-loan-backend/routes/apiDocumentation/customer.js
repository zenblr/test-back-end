/**
 * @swagger
 * /customer/get-otp:
 *   get:
 *     tags:
 *       - Get-otp
 *     name: Customer-otp-api
 *     summary: To read otp
 *     security:
 *       - bearerAuth: [] 
 *     consumes:
 *       - application/json
 *     responses:
 *      200:
 *        description: Success
 *      404:
 *        description: Internal server error.
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
 *             pinCode:
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
 *                 postalCode: 
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
 *     - name: "cityId"
 *       in: "query"
 *       description: "enter city Id"
 *       type: "integer"
 *     - name: "stateId"
 *       in: "query"
 *       description: "enter state Id"
 *       type: "integer"
 *     - name: "statusId"
 *       in: "query"
 *       description: "enter status Id"
 *       type: "integer"
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
 *       - name: "customerId"
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
 *                 statusId:
 *                   type: number
 *         required:
 *           - cityId
 *           - stateId
 *           - pinCode
 *           - internalBranchId
 *           - statusId
 *     responses:
 *       200:
 *          description: customer Updated
 *       404:
 *          description: Customer is not exist
 * /customer/customer-unique:
 *   get:
 *     tags:
 *       - Customer Registration
 *     name: read customer unique id
 *     summary: To read customer Unique Id
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *          description: success
 * /customer/customer-management:
 *  get:
 *     tags:
 *       - Customer Management
 *     name: read customer for customer management
 *     summary: To read customer for customer management
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
 *     responses:
 *       200:
 *          description: Success
 * /customer/customer-management/{customerId}:
 *   get:
 *     tags:
 *       - Customer Management
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
 * 
 *  
 */