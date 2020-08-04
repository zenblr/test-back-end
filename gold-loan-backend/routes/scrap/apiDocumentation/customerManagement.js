/**
 * @swagger
 * /scrap/customer/scrap-details:
 *   get:
 *     tags:
 *       -  Customer management
 *     name: read scrap details in customer management
 *     summary: To read scrap details
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
 *          description: scrap details fetch successfully
 *       404:
 *          description: no scrap details found
 * /scrap/customer/customer-management:
 *  get:
 *     tags:
 *       - Customer management
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
 *     - name: "cityId"
 *       in: "query"
 *       description: "id of city"
 *       type: "string"
 *     - name: "stateId"
 *       in: "query"
 *       description: "id of state"
 *       type: "string"
 *     responses:
 *       200:
 *          description: Success
 * /scrap/customer/customer-management/{customerId}:
 *  get:
 *     tags:
 *       - Customer management
 *     summary: To read single customer for customer management
 *     parameters:
 *     - name: "customerId"
 *       in: "path"
 *       description: "customer Id to read"
 *       required: true
 *       type: integer
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *          description: Success
 */