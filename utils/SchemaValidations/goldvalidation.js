const Joi = require('@hapi/joi')

const goldAddRecordSchema = Joi.object({
    uid: Joi.number().integer().required(),
    perGramPrice: Joi.number().required(),
    numberOfGrams: Joi.number().integer().required(),
    totalAmount: Joi.number().required()
})

const goldRemoveRecordSchema = Joi.object({
    uid: Joi.number().integer().required(),
    numberOfGrams: Joi.number().integer().required(),
})

module.exports = {
    goldAddRecordSchema,goldRemoveRecordSchema
}