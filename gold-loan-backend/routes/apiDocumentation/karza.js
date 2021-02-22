/**
 * @swagger
 * /e-kyc/pan-details:
 *   post:
 *     tags:
 *       - E KYC API
 *     name: Get Name by pan card number
 *     summary: To get name from pan card
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
 *             panCardNumber:
 *               type: string
 *         required:
 *           - panCardNumber
 *     responses:
 *       200:
 *          description: Name from pancard
 *       400:
 *          description: Invalid Pan Card number
 * /e-kyc/name-similarity:
 *   post:
 *     tags:
 *       - E KYC API
 *     name: name similarity
 *     summary: to check name similarity with score
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
 *             name1:
 *               type: string
 *             name2:
 *               type: string
 *         required:
 *           - name1
 *           - name2
 *     responses:
 *       200:
 *          description: If both name same
 *       400:
 *          description: Name does not match
 * /e-kyc/pan-status:
 *   post:
 *     tags:
 *       - E KYC API
 *     name: Pan status check api
 *     summary: to check pan status
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
 *             panCardNumber:
 *               type: string
 *             fullName:
 *               type: string
 *             dateOfBirth:
 *               type: string
 *         required:
 *           - panCardNumber
 *           - fullName
 *           - dateOfBirth
 *     responses:
 *       200:
 *          description: varified pan 
 *       400:
 *          description: Invalid ID Number or combination of inputs
 * /e-kyc/ocr-aadhaar:
 *   post:
 *     tags:
 *       - E KYC API
 *     name: KYC OCR ( Aadhaar)
 *     summary: KYC OCR
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
 *             fileUrls:
 *               type: array
 *               items:
 *                type: string
 *             customerId:
 *               type: number
 *         required:
 *           - fileUrls
 *           - customerId
 *     responses:
 *       200:
 *          description: document details
 *       400:
 *          description: failed to retrive data
 * /e-kyc/ocr-pan:
 *   post:
 *     tags:
 *       - E KYC API
 *     name: KYC OCR ( pan card)
 *     summary: KYC OCR
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
 *             fileUrl:
 *               type: string
 *             customerId:
 *               type: number
 *         required:
 *           - fileUrl
 *           - customerId
 *     responses:
 *       200:
 *          description: document details
 *       400:
 *          description: failed to retrive data
 * /e-kyc/data:
 *   get:
 *     tags:
 *       - E KYC API
 *     name: get customer ekyc data
 *     summary: to get customer ekyc data
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     parameters:
 *     - name: "customerId"
 *       in: "query"
 *       description: "customerId to get data"
 *     responses:
 *       200:
 *          description: document details
 *       400:
 *          description: failed to retrive data
 * /e-kyc/ocr-voter:
 *   post:
 *     tags:
 *       - E KYC API
 *     name: KYC OCR ( Voter id)
 *     summary: KYC OCR
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
 *             fileUrls:
 *               type: array
 *               items:
 *                type: string
 *             customerId:
 *               type: number
 *         required:
 *           - fileUrls
 *           - customerId
 *     responses:
 *       200:
 *          description: document details
 *       400:
 *          description: failed to retrive data
 */
