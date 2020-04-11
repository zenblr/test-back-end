/**
 * @swagger
 * /customer/send-register-otp:
 *   post:
 *     tags:
 *       - Customer  By Admin
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
 *             mobileNumber:
 *               type: integer
 *             email:
 *               type: string
 *             panCardNumber:
 *               type: string  
 *             stateId:
 *               type: number
 *             cityId:
 *               type: number
 *             address:
 *               type: array
 *             statusId:
 *               type: number 
  
 *         required:
 *           - firstName
 *           - lastName
 *           - referenceCode
 *           - mobileNumber
 *           - email
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
 * /customer:
 *   get:
 *     tags:
 *       - Customer By Admin
 *     name: read customers
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
 *       typse: "string"
 *     responses:
 *       200:
 *          description: Success
 *       500:
 *          description: Internal server error
 *   put:
 *     tags:
 *       - Customer By Admin
 *     name: update customer
 *     summary: To update customer
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
 *             id:
 *               type: number
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             mobileNumber:
 *               type: integer
 *             email:
 *               type: string
 *             panCardNumber:
 *               type: string  
 *             address:
 *               type: array
 *             cityId:
 *               type: number
 *             stateId:
 *               type: number
 *             ratingId:
 *               type: number
 *             statusId:
 *               type: number 
 *             stageId:
 *               type: number
 *             isActive:
 *               type: boolean
 *         required:
 *           - id
 *           - firstName
 *           - lastName
 *           - mobileNumber
 *           - email
 *           - panCardNumber
 *           - address
 *           - cityId
 *           - stateId
 *           - ratingId
 *           - statusId
 *           - stageId
 *           - isActive
 *     responses:
 *       200:
 *          description: User Updated
 *       404:
 *          description: Customer is not exist/This Mobile number is already Exist
 *   delete:
 *     tags:
 *       - Customer By Admin
 *     summary: To delete by Id
 *     parameters:
 *     - name: "customerId"
 *       in: "query"
 *       description: "Id of customer to delete"
 *       required: false
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: "isActive to delete"
 *       required: false
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
 * /{customerId}:
 *   get:
 *     tags:
 *       - Customer By Admin
 *     summary: To read by Id
 *     parameters:
 *     - name: "customerId"
 *       in: "path"
 *       description: "Id of customer to read"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success.
 *       404:
 *         description: Customer not found
 * customer/send-otp:
 *   post:
 *     tags:
 *       - Customer  By Admin
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
 *               type: string
 *         required:
 *           - mobileNumber
 *     responses:
 *       200:
 *         description: Otp send to your entered mobile number.
 *       404:
 *         description: Mobile number is not Exist.
 * customer/verify-otp:
 *   post:
 *     tags:
 *       - Customer  By Admin
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
 *         description: Invalid otp..
 *    
 */