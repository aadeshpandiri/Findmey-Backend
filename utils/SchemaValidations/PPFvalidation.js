const Joi = require('@hapi/joi')

const PPFRecordSchema = Joi.object({
    uid: Joi.number().integer().required(),
    ppfAmount: Joi.number().required()
})

module.exports = {
    PPFRecordSchema
}