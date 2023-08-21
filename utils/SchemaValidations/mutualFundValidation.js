const Joi = require('@hapi/joi')

const mutualFundRecordSchema = Joi.object({
    uid: Joi.number().integer().required(),
    schemeCode: Joi.number().required(),
    schemeName: Joi.string().required(),
    perSharePrice: Joi.number().required(),
    numberOfShares: Joi.number().integer().required(),
    totalAmount: Joi.number().required()
})

module.exports = {
    mutualFundRecordSchema
}