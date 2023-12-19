// Sanitizer for Code Llamav2
const { validationResult, matchedData, sanitize } = require('express-validator');

// Middleware for sanitizing input
const sanitizeInput = () => {
    return [
        // Define sanitization rules for Code Llamav2 here
        // For example, sanitize a 'username' field:
        // sanitize('username').trim().escape(),

        // Add as many sanitization rules as needed
    ];
};

// Middleware for handling sanitization results
const checkSanitization = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    req.body = matchedData(req); // Only keep sanitized data
    next();
};

module.exports = { sanitizeInput, checkSanitization };
