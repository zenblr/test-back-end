
/**
* @swagger
* /data-transfer/deposit-transfer-previous-data:
*   post:
*     tags:
*       - Add navision data transfer
*     summary: To add deposit data 
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: deposit data created
*       422:
*         description: deposit data not created
* /data-transfer/withdraw-transfer-previous-data:
*   post:
*     tags:
*       -  Add navision data transfer
*     summary: To add withdraw data 
*     security:
*       - bearerAuth: []
*     consumes:
*       - application/json
*     responses:
*       200:
*         description: deposit data created
*       422:
*         description: deposit data not created
*/