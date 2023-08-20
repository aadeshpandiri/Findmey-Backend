const Joi = require('@hapi/joi')

const savingRecordSchema = Joi.object({
    uid: Joi.number().integer().required(),
    savingsAmount: Joi.number().required()
})

module.exports = {
    savingRecordSchema
}