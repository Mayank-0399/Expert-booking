const { body, validationResult } = require('express-validator');

exports.validateBooking = [
  body('expertId').notEmpty().withMessage('Expert ID is required').isMongoId().withMessage('Invalid expert ID'),
  body('userName').notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('userEmail').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email address'),
  body('userPhone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[\d\s\-()]{7,15}$/)
    .withMessage('Invalid phone number'),
  body('date').notEmpty().withMessage('Date is required').isDate().withMessage('Invalid date format'),
  body('timeSlot').notEmpty().withMessage('Time slot is required').matches(/^\d{2}:\d{2}$/).withMessage('Invalid time format'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];
