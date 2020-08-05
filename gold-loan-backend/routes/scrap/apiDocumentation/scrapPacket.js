/**
 * @swagger
 * /scrap/packet:
 *   post:
 *     tags:
 *       - Packet
 *     name: Packet
 *     summary: To add packet
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
 *             packetUniqueId:
 *               type: string
 *             barcodeNumber:
 *               type: integer
 *             internalUserBranchId:
 *               type: integer
 *         required:
 *           - packetUniqueId
 *           - barcodeNumber
 *           - internalUserBranchId
 *     responses:
 *       201:
 *          description: you adeed packet successfully
 *       400:
 *          description: This packet Id is already exist
 *   get:
 *     tags:
 *       - Packet
 *     name: read Packet
 *     summary: To read Packet
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
 *          description: packet details fetch successfully
 * /scrap/packet/{id}:
 *   put:
 *     tags:
 *       - Packet
 *     summary: To update Packet
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: "id"
 *         in: "path"
 *         description: "Id of packet to update"
 *         required: true
 *         type: "integer"
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             packetUniqueId:
 *               type: string
 *             barcodeNumber:
 *               type: integer
 *             internalUserBranchId:
 *               type: integer
 *         required:
 *           - packetUniqueId
 *     responses:
 *       200:
 *         description: packet updated successfully
 *       404:
 *         description: packet not updated
 *   delete:
 *     tags:
 *       - Packet
 *     summary: To delete by Id
 *     parameters:
 *     - name: "id"
 *       in: "path"
 *       description: "Id of Packet to delete"
 *       required: true
 *       type: "integer"
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: Updated.
 *       404:
 *         description: Packet deleted failed.
 * /scrap/packet/available-packet:
 *   get:
 *     tags:
 *       - Packet
 *     summary: To read the available Packet
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     responses:
 *       200:
 *         description: avalable packet details fetch successfully
 *       404:
 *         description: no packet details found
 * /scrap/packet/assign-appraiser:
 *   put:
 *     tags:
 *       - Packet
 *     summary: To assign appraiser
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
 *             packetId:
 *               type: array
 *               items:
 *                type: integer
 *             appraiserId:
 *               type: integer
 *         required:
 *           - packetId
 *           - appraiserId
 *     responses:
 *       200:
 *         description: appraiser assigned successfully
 *       404:
 *         description: appraiser not assigned
 */
