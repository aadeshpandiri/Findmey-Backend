const Joi = require('@hapi/joi')

const customTrackerSchema = Joi.object({
    uid: Joi.number().integer().required(),
    trackerName: Joi.string().required(),
    investedAmount: Joi.number().required(),
    valueTimeofInvestment: Joi.number().required(),
    currentValue: Joi.number().integer().required()
})

const customTrackerSchemaEdit = Joi.object({
    id: Joi.number().integer().required(),
    uid: Joi.number().integer().required(),
    investedAmount: Joi.number().required(),
    valueTimeofInvestment: Joi.number().required(),
    currentValue: Joi.number().integer().required()
})

module.exports = {
    customTrackerSchema,
    customTrackerSchemaEdit
}