/**
 * @swagger
 * /customer/add-customer:
 *   post:
 *     tags:
 *       - Customer By Admin
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
 *             password:
 *               type: string
 *             mobileNumber:
 *               type: integer
 *             email:
 *               type: string
 *             panCardNumber:
 *               type: string  
 *             address:
 *               type: string
 *             cityId:
 *               type: number
 *             stateId:
 *               type: number
 *             postal code:
 *               type: number
 *             ratingId:
 *               type: number
 *             statusId:
 *               type: number 
  
 *         required:
 *           - firstName
 *           - lastName
 *           - password
 *           - mobileNumber
 *           - email
 *           - panCardNumber
 *           - address
 *           - cityId
 *           - stateId
 *           - postal code
 *           - ratingId
 *           - statusId
 *     responses:
 *       200:
 *          description: User Created
 *       404:
 *          description: This Mobile number is already Exist
 *       500:
 *          description: Something went wrong/Internal server error
 * /customer/get-all-customer:
 *   get:
 *     tags:
 *       - Customer By Admin
 *     name: read customers
 *     summary: To read customer
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *          description: Success
 *       500:
 *          description: Internal server error
 * 
 * /customer/edit-customer:
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
 *             password:
 *               type: string
 *             mobileNumber:
 *               type: integer
 *             email:
 *               type: string
 *             panCardNumber:
 *               type: string  
 *             address:
 *               type: string
 *             cityId:
 *               type: number
 *             stateId:
 *               type: number
 *             postal code:
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
 *           - password
 *           - mobileNumber
 *           - email
 *           - panCardNumber
 *           - address
 *           - cityId
 *           - stateId
 *           - postal code
 *           - ratingId
 *           - statusId
 *           - stageId
 *           - isActive
 *     responses:
 *       200:
 *          description: User Updated
 *       404:
 *          description: Customer is not exist/This Mobile number is already Exist
 *       500:
 *          description: something went wrong/Internal server error
 * /customer/deactivate-customer:
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
 *       500:
 *         description: Internal server error.
 * /customer/get-single-customers:
 *   get:
 *     tags:
 *       - Customer By Admin
 *     summary: To read by Id
 *     parameters:
 *     - name: "customerId"
 *       in: "query"
 *       description: "Id of customer to read"
 *       required: false
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
 *       500:
 *         description: Internal server error.
 */