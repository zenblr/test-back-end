/**
 * @swagger
 * /modules:
 *   get:
 *     tags:
 *       - Module
 *     name: module
 *     summary: To read all module list
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *        - application/json
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: data not found
 */