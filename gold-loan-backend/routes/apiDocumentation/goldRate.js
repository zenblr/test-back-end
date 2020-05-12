/**
 * @swagger
 * /gold-rate:
 *   post:
 *     tags:
 *       - Gold Rate
 *     name: Gold Rate
 *     summary: To add gold rate
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
 *             goldRate:
 *               type: integer
 *         required:
 *           - goldRate
 *     responses:
 *       200:
 *          description: success
 *   get:
 *     tags:
 *       - Gold Rate
 *     name: read gold rate
 *     summary: To read gold rate
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *          description: Success
 *       404:
 *          description: Data not found
 */
