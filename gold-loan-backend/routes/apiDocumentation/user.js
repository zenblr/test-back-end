/**
 * @swagger
 * /user:
 *   post:
 *     tags:
 *       - User Registration
 *     name: Registration
 *     summary: To Register  
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
 *               type: string
 *             email:
 *               type: string
 *             panCardNumber:
 *               type: string  
 *             address:
 *                type: array
 *                items:
 *                  type: object  
 *                  properties:
 *                   address:
 *                    type: string
 *                   landMark:
 *                    type: string
 *                   stateId:
 *                    type: number
 *                   cityId:
 *                    type: number
 *             roleId:
 *               type: number 
 *             userTypeId:
 *               type: number
 *             internalBranchId:
 *              type: number      
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
 *           - roleId
 *           - userTypeId:
 *           - internalBranchId
 *     responses:
 *       200:
 *          description: User Created
 *       404:
 *          description: This Mobile number is already Exist/This Email id is already exist
 *   get:
 *     tags:
 *      - User Registration
 *     name: read user
 *     summary: To read user 
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *          description: Success
 * /user/verify-otp:
 *   post:
 *     tags:
 *       - User Registration
 *     name: Verification Otp
 *     summary: To Verify Otp
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
 *               type: integer
 *               
 *         required:
 *           - referenceCode
 *           - otp
 *     responses:
 *       200:
 *          description: Success
 *       400:
 *          description: Invalid Otp
 * 
 * /user/send-otp:
 *   post:
 *     tags:
 *       - User Registration
 *     name: Resend Otp
 *     summary: Resend Otp
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
 *               
 *         required:
 *           - mobileNumber
 *     responses:
 *       200:
 *          description: Otp send to your Mobile number
 *       400:
 *          description: User does not exists, please contact to Admin
 * /user/change-password:
 *   post:
 *     tags:
 *       - User Registration
 *     name: Change password
 *     summary: To change password
 *     consumes:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             oldPassword:
 *               type: string
 *             newPassword:
 *               type: string
 *               
 *         required:
 *           - oldPassword
 *           - newpassword
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: User not found . Please contact Admin.
 *       401:
 *          description: wrong credentials
 * /user/update-password:
 *   post:
 *     tags:
 *       - User Registration
 *     name: Update Password
 *     summary: To update  password
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
 *             newPassword:
 *               type: string  
 *         required:
 *           - referenceCode
 *           - otp
 *           - new Password
 *     responses:
 *       200:
 *          description: Password Updated
 *       404:
 *          description: User not found . Please contact Admin.
 *       401:
 *          description: wrong credentials   
 * /user/addAdmin:
 * post:
 *    tags:
 *      - User Registration
 *    name: add admin
 *    summary: To add admin
 *    consumes:
 *       - application/json
 *    parameters:
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
 *               type: string
 *             email:
 *               type: string
 *             panCardNumber:
 *               type: string  
 *             address:
 *                type: array
 *                items:
 *                  type: object  
 *                  properties:
 *                   address:
 *                    type: string
 *                   landMark:
 *                    type: string
 *                   stateId:
 *                    type: number
 *                   cityId:
 *                    type: number
 *             roleId:
 *               type: number 
 *             userTypeId:
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
 *           - roleId
 *           - userTypeId
 *    responses:
 *       200:
 *          description: Success
 * /user/internal-user:
 *   post:
 *     tags:
 *       - Internal User
 *     name: add internal user
 *     summary: To add internal user  
 *     consumes:
 *       - application/json
 *     security:
 *       - bearerAuth: []
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
 *             mobileNumber:
 *               type: string
 *             email:
 *               type: string
 *             roleId:
 *               type: number   
 *             internalBranchId:
 *               type: number     
 *             userUniqueId:
 *               type: string      
 *         required:
 *           - firstName
 *           - lastName
 *           - password
 *           - mobileNumber
 *           - email
 *           - roleId
 * 
 *     responses:
 *       200:
 *          description: internal user added
 *       404:
 *          description: failed to add internal user
 *   get:
 *     tags:
 *       - Internal User
 *     name: Read Internal User
 *     summary: To read Internal User with pagination
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
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Data found
 *       404:
 *         description: Data not found
 * /user/internal-user/{id}:
 *   put:
 *     tags:
 *       - Internal User
 *     name: add internal user
 *     summary: To add internal user  
 *     consumes:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "id to edit internal user"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             mobileNumber:
 *               type: string
 *             email:
 *               type: string
 *             roleId:
 *               type: number   
 *             internalBranchId:
 *               type: number      
 *         required:
 *           - firstName
 *           - lastName
 *           - password
 *           - mobileNumber
 *           - email
 *           - roleId
 * 
 *     responses:
 *       200:
 *          description: internal user updated
 *       404:
 *          description: failed to update internal user
 *   delete:
 *     tags:
 *       - Internal User
 *     name: delete internal user
 *     summary: To add internal user  
 *     consumes:
 *       - application/json
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "id to edit internal user"
 *         required: true
 *         type: "integer"
 *     responses:
 *       200:
 *          description: internal user deleted
 *       404:
 *          description: failed to delete internal user
 *    
 * 
 */