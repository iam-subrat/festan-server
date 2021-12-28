const { validationResult } = require('express-validator');

// Throws error if input validation fails
const inputValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

module.exports = inputValidationResult;