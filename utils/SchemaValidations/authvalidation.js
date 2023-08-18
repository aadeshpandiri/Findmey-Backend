const Joi = require('@hapi/joi')

const loginSchema = Joi.object({
    email: Joi.string().email().max(100).required(),
    password: Joi.string().min(8).max(10).required()
})

const registerSchema = Joi.object({
    email: Joi.string().email().max(100).required(),
    password: Joi.string().min(8).max(10).required(),
    confirmPassword: Joi.ref('password'),
    phoneNumber: Joi.string().min(10).max(13).required()
})

module.exports = {
    loginSchema,
    registerSchema
}