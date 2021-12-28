const { body } = require('express-validator');

const registerFormValidation = [
    body('first_name').isString().trim().escape(), 
    body('last_name').isString().trim().escape(), 
    body('password').isLength({ min: 6 }).escape(),
    body('password_repeat').isLength({ min: 6 }).escape(),
    body('email').isEmail(),
    body('phone').isMobilePhone(),
    body('pan').isString().trim().escape()
]

const loginFormValidation = [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }).escape()
]

const ownerProfileFormValidation = [
    body('first_name').isString().trim().escape().notEmpty(),
    body('last_name').isString().trim().escape(),
    body('email').isEmail().notEmpty(),
    body('pan_num').isString().trim().escape(),
    body('phone').isMobilePhone().notEmpty()
]

const propertyFormValidation = [
    body('propname').isString().trim(),
    body('address').isString().trim().notEmpty(),
    body('city').isString().trim().notEmpty(),
    body('state').isString().trim().notEmpty(),
    body('pincode').isNumeric().notEmpty(),
    body('contact').isMobilePhone().notEmpty(),
    body('size').notEmpty(),
    body('capacity').notEmpty(),
    body('cost').notEmpty(),
    body('desc').isString().trim()
]

const bankAccountFormValidation = [
    body('acholdername').isString().trim().escape().notEmpty(),
    body('acnum').isNumeric().notEmpty(),
    body('ifsc').isAlphanumeric().notEmpty(),
]

const accountFormValidation = [
    body('password').isLength({ min: 6 }).escape(),
    body('newpassword').isLength({ min: 6 }).escape(),
    body('passwordrepeat').isLength({ min: 6 }).escape(),
]

module.exports = { registerFormValidation, loginFormValidation, ownerProfileFormValidation, propertyFormValidation, bankAccountFormValidation, accountFormValidation }
