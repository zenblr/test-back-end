/**
* @swagger
* /digital-gold/bank:
*   get:
*     tags:
*       - Bank
*     name: Read Bank List
*     summary: To read bank list
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
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
*     responses:
*       200:
*         description: Data found
*       404:
*         description: Data not found
*/