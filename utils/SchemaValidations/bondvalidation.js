const Joi = require('@hapi/joi')

const bondRecordSchema = Joi.object({
    uid: Joi.number().integer().required(),
    bondName: Joi.string().required(),
    bondType: Joi.string().required(),
    totalAmount: Joi.number().required()
})

module.exports = {
    bondRecordSchema
}