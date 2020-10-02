/**
 * @swagger
 * /scrap/scrap-packet-location:
 *   post:
 *     tags:
 *       - Packet Location
 *     name: add packet location
 *     summary: To add packet location
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
 *             location:
 *               type: string
 *         required:
 *           - location
 *     responses:
 *       201:
 *          description: packet location added
 *       400:
 *          description: failed to add packet location
 *   get:
 *     tags:
 *       - Packet Location
 *     name: read Packet Location
 *     summary: To read Packet Location with pagination
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
 *          description: Success
 *       404:
 *          description: Data not found
 *   delete:
 *     tags:
 *       - Packet Location
 *     summary: To delete Packet Location by Id
 *     parameters:
 *     - name: "id"
 *       in: "query"
 *       description: "Id of packet location to delete"
 *       required: true
 *       type: "integer"
 *     - name: "isActive"
 *       in: "query"
 *       description: " value of isActive of packet location to delete"
 *       required: true
 *       type: "boolean"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Updated.
 *       404:
 *         description: failed to delete packet location
 * /scrap/scrap-packet-location/{id}:
 *   put:
 *     tags:
 *       - Packet Location
 *     summary: To update Packet Location
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of packet location to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             location:
 *               type: string
 *         required:
 *           - name
 *     responses:
 *       200:
 *         description: success
 *       404:
 *         description: Data not Updated
 */
