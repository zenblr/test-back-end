/**
* @swagger
* /digital-gold/rates:
*   get:
*     tags:
*       - Gold/Silver Rates
*     name: Get gold/silver rates
*     summary: To read gold/silver rates
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