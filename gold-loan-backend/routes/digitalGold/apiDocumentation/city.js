/**
* @swagger
* /digital-gold/city:
*   get:
*     tags:
*       - City
*     name: Read City List
*     summary: To read city list
*     security:
*       - bearerAuth: []
*     parameters:
*     - name: "stateId"
*       in: "query"
*       description: "Get cities list by state Id"
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