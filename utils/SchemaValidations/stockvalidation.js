const Joi = require('@hapi/joi')

const stockRecordSchema = Joi.object({
    uid: Joi.number().integer().required(),
    stockSymbol: Joi.string().required(),
    stockName: Joi.string().required(),
    perSharePrice: Joi.number().required(),
    numberOfShares: Joi.number().integer().required(),
    totalAmount: Joi.number().required()
})

module.exports = {
    stockRecordSchema
}