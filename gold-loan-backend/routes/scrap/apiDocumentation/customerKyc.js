/**
* @swagger
* /kyc/applied-kyc:
*   get:
*     tags:
*       - Customer kyc
*     name: Read applied kyc customer
*     summary: To read applied kyc customer with pagination
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
*/