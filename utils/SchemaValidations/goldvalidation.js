const Joi = require('@hapi/joi')

const goldRecordSchema = Joi.object({
    uid: Joi.number().integer().required(),
    perGramPrice: Joi.number().required(),
    numberOfGrams: Joi.number().integer().required(),
    totalAmount: Joi.number().required()
})

module.exports = {
    goldRecordSchema
}