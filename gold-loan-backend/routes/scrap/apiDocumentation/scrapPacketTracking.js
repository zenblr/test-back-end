/**
 * @swagger
 * /scrap/scrap-packet-tracking/check-barcode:
 *   get:
 *     tags:
 *       - Packet Tracking
 *     name: Check Barcode
 *     summary: To verify barcode
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "packetId"
 *       in: "query"
 *       description: "id of packet"
 *       type: "integer"
 *     - name: "Barcode"
 *       in: "query"
 *       description: "barcode of packet"
 *       type: "string"
 *     responses:
 *       200:
 *          description: packet details fetch successfully
 * /scrap/scrap-packet-tracking/view-packets:
 *   get:
 *     tags:
 *       - Packet Tracking
 *     name: get Packet
 *     summary: To packet data
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "scrapId"
 *       in: "query"
 *       description: "id of scrap"
 *       type: "integer"
 *     responses:
 *       200:
 *          description: packet details fetch successfully
 *       404:
 *          description: data not found
 * /scrap/scrap-packet-tracking/get-particular-location:
 *   get:
 *     tags:
 *       - Packet Tracking
 *     name: get perticular location
 *     summary: To packet data
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "scrapId"
 *       in: "query"
 *       description: "id of scrap"
 *       type: "integer"
 *     - name: "packetLocationId"
 *       in: "query"
 *       description: "id packet location"
 *       type: "integer"
 *     responses:
 *       200:
 *          description: packet details fetch successfully
 *       404:
 *          description: data not found
 * /scrap/scrap-packet-tracking/user-name:
 *   get:
 *     tags:
 *       - Packet Tracking
 *     name: user name
 *     summary: To Fetch User Name
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "mobileNumber"
 *       in: "query"
 *       description: "mobile number of user"
 *       type: "string"
 *     - name: "receiverType"
 *       in: "query"
 *       description: "receiver type"
 *       type: "string"
 *     - name: "scrapId"
 *       in: "query"
 *       description: "id of scrap"
 *       type: "string"
 *     responses:
 *       200:
 *          description: packet details fetch successfully
 *       404:
 *          description: data not found
 * /scrap/scrap-packet-tracking/submit-packet-location:
 *   post:
 *     tags:
 *       - Packet Tracking
 *     name: submit packet location
 *     summary: To submit packet location
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
 *             internalBranchId:
 *               type: integer
 *             userReceiverId:
 *               type: integer
 *             receiverType:
 *               type: string
 *             packetLocationId:
 *               type: integer
 *             scrapId:
 *               type: integer
 *     responses:
 *       200:
 *          description: Packet location added successfully
 *       404:
 *          description: data not found
 * /scrap/scrap-packet-tracking/view-log:
 *   get:
 *     tags:
 *       - Packet Tracking
 *     name: tracking logs
 *     summary: To Fetch tracking logs
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "scrapId"
 *       in: "query"
 *       description: "id of scrap"
 *       type: "integer"
 *     responses:
 *       200:
 *          description: packet details fetch successfully
 *       404:
 *          description: data not found
 * /scrap/scrap-packet-tracking/tracking-details:
 *   get:
 *     tags:
 *       - Packet Tracking
 *     name: read Packet Tracking
 *     summary: To read all Packet Tracking
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
 *     - name: "scrapStageId"
 *       in: "query"
 *       description: "filter by scrap status"
 *       type: "integer"
 *     responses:
 *       200:
 *          description: packet details fetch successfully
 * /scrap/scrap-packet-tracking:
 *   post:
 *     tags:
 *       - Packet Tracking
 *     name: add packet location
 *     summary: api for branch out
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
 *             receiverType:
 *               type: string
 *             packetLocationId:
 *               type: integer
 *             scrapId:
 *               type: integer
 *             courier:
 *               type: integer
 *             podNumber:
 *               type: integer
 *     responses:
 *       200:
 *          description: Packet location added successfully
 *       404:
 *          description: data not found
 * /scrap/scrap-packet-tracking/next-packet-location:
 *   get:
 *     tags:
 *       - Packet Tracking
 *     name: read next packet location
 *     summary: To read next packet location
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "scrapId"
 *       in: "query"
 *       description: "id of scrap"
 *       type: "string"
 *     responses:
 *       200:
 *          description: next packet location fetch successfully
 *       404:
 *          description: data not found
 */
