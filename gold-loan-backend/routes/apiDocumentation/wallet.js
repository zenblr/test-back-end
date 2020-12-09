/**
 * @swagger
 * /wallet/get-request-admin:
 *   get:
 *     tags:
 *       -  Wallet
 *     name: read deposit request
 *     summary: To read wallet deposit request
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
 *     - name: "paymentFor"
 *       in: "query"
 *       description: "paymentFor"
 *       type: "string"
 *     responses:
 *       200:
 *          description: deposit request fetch successfully
 *       404:
 *          description: no deposit request found
 * /wallet/{depositWithdrawId}:
 *   put:
 *     tags:
 *       - Wallet
 *     name: update Wallet status
 *     summary: To update update Wallet status
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "depositWithdrawId"
 *         in: "path"
 *         description: "Id of wallet to update"
 *         required: true
 *         type: integer
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *                 depositStatus:
 *                   type: string
 *         required:
 *           - depositStatus
 *     responses:
 *       200:
 *          description: customer Updated
 *       404:
 *          description: Customer is not exist
 *   get:
 *     tags:
 *       - Wallet
 *     summary: To read Wallet by Id
 *     parameters:
 *     - name: "depositWithdrawId"
 *       in: "path"
 *       description: "Id of wallet to read"
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
 */