const Joi = require('@hapi/joi')

const financeRecordSchema = Joi.object({
    uid: Joi.number().integer().required(),
    date: Joi.date().required(),
    modeOfOperation: Joi.string().required(),
    incomeValue: Joi.number().integer(),
    shoppingValue: Joi.number().integer(),
    paymentValue: Joi.number().integer(),
    foodValue: Joi.number().integer(),
    othersValue: Joi.number().integer(),
})

module.exports = {
    financeRecordSchema
}