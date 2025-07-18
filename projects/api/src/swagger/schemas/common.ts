/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - _id
 *         - email
 *       properties:
 *         _id:
 *           type: string
 *           description: The user's unique identifier
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email address
 *         firstName:
 *           type: string
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           description: The user's last name
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the user was last updated
 *
 *     AuthRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success, fail]
 *         message:
 *           type: string
 *           description: Response message
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT token
 *             user:
 *               $ref: '#/components/schemas/User'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [fail, error]
 *         message:
 *           type: string
 *           description: Error message
 *         error:
 *           type: string
 *           description: Detailed error information
 *
 *     HealthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success]
 *         message:
 *           type: string
 *           description: Health status message
 *         data:
 *           type: object
 *           properties:
 *             timestamp:
 *               type: string
 *               format: date-time
 *             uptime:
 *               type: number
 *               description: Server uptime in seconds
 *
 *     Submission:
 *       type: object
 *       required:
 *         - _id
 *         - data
 *         - user
 *         - dateCreated
 *       properties:
 *         _id:
 *           type: string
 *           description: The submission's unique identifier
 *         data:
 *           type: string
 *           description: The submission data content
 *         user:
 *           $ref: '#/components/schemas/User'
 *         dateCreated:
 *           type: string
 *           format: date-time
 *           description: When the submission was created
 *         deleted:
 *           type: boolean
 *           description: Whether the submission is deleted
 *           default: false
 *
 *     SubmissionRequest:
 *       type: object
 *       required:
 *         - data
 *       properties:
 *         data:
 *           type: string
 *           description: The submission data content
 *
 *     SubmissionResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success, fail]
 *         message:
 *           type: string
 *           description: Response message
 *         data:
 *           $ref: '#/components/schemas/Submission'
 *
 *     SubmissionListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success, fail]
 *         message:
 *           type: string
 *           description: Response message
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Submission'
 */
