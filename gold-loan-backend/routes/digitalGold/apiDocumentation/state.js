/**
* @swagger
* /digital-gold/state:
*   get:
*     tags:
*       - State
*     name: Get state List
*     summary: To read states
*     security:
*       - bearerAuth: []
*     parameters:
*     - name: "search"
*       in: "query"
*       description: "search your keyword"
*       type: "string"
*     - name: "count"
*       in: "query"
*       description: "no of count to return"
*       type: "string"
*     - name: "page"
*       in: "query"
*       description: "page number"
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
*/