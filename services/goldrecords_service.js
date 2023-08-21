const GoldHistoryModel = require("../utils/Models/Gold/GoldHistoryModel");
const GoldMergedModel = require("../utils/Models/Gold/GoldMergedModel");
const GoldRecordModel = require("../utils/Models/Gold/GoldRecordsModel");
const { goldRecordSchema } = require("../utils/SchemaValidations/goldvalidation");
const axios = require('axios')

class GoldRecordsService{
    constructor(){

    }

    async saveGoldRecord(payload) {
        try {
            const validateData = await goldRecordSchema.validateAsync(payload)
            console.log("Validated Data", validateData);

            return await DATA.CONNECTION.mysql.transaction(async (t) => {

                const response = await GoldHistoryModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while saving in gold history table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                console.log("Saved in History table")

                await GoldRecordModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while saving in gold records table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("Saved in gold records table")

                let data = await GoldMergedModel.findOne({
                    where: {
                        uid: validateData.uid,
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while finding record in merged model", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                if (!data) {
                    console.log('Newly adding in merged table')
                    data = await GoldMergedModel.create(validateData, {
                        transaction: t
                    }).catch(err => {
                        console.log("Error while saving in merged table", err.message);
                        throw createError.InternalServerError(SQL_ERROR)
                    })
                }
                else {  
                    //already existed gold investment for user so merge it
                    const updatedData = {
                        ...validateData,
                        numberOfGrams: data.numberOfGrams + validateData.numberOfGrams,
                        totalAmount: data.totalAmount + validateData.totalAmount,
                        perGramPrice: (data.totalAmount + validateData.totalAmount) / (data.numberOfGrams + validateData.numberOfGrams)
                    }

                    await GoldMergedModel.update(updatedData, {
                        where: {
                            uid: validateData.uid,
                        },
                        transaction: t
                    }).catch(err => {
                        console.log("Error while updating in merged table", err.message);
                        throw err;
                    })
                }

                console.log("Transaction Completed")

                return response;
            })

        }
        catch (err) {
            throw err;
        }
    }

    async editGoldRecord(payload) {
        try {
            const validateData = await goldRecordSchema.validateAsync(payload)
            console.log("Validated Data", validateData);

            return await DATA.CONNECTION.mysql.transaction(async (t) => {

                const deleteRecord = await GoldMergedModel.findOne({
                    where: {
                        uid: validateData.uid,
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while finding in merged table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                await GoldMergedModel.destroy({
                    where: {
                        uid: validateData.uid,
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while deleting from merged table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                const historyPayload = {
                    uid: deleteRecord.uid,
                    totalAmount: -1 * (deleteRecord.totalAmount),
                    numberOfGrams: -1 * (deleteRecord.numberOfGrams),
                    perGramPrice: -1 * (deleteRecord.perGramPrice)
                }

                await GoldHistoryModel.create(historyPayload, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while adding deleted record to history table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("Added in history table");

                await GoldRecordModel.destroy({
                    where: {
                        uid: validateData.uid,
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while deleting from records table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                });

                const response = await GoldHistoryModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while saving in history table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                console.log("Saved in History table")

                await GoldRecordModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while saving in Gold records table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("Saved in Stock records table")

                let data = await GoldMergedModel.findOne({
                    where: {
                        uid: validateData.uid,
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while finding record in merged model", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                if (!data) {
                    console.log('Newly adding in merged table')
                    data = await GoldMergedModel.create(validateData, {
                        transaction: t
                    }).catch(err => {
                        console.log("Error while saving in merged table", err.message);
                        throw createError.InternalServerError(SQL_ERROR)
                    })
                }
                else {
                    const updatedData = {
                        ...validateData,
                        numberOfGrams: data.numberOfGrams + validateData.numberOfGrams,
                        totalAmount: data.totalAmount + validateData.totalAmount,
                        perGramPrice: (data.totalAmount + validateData.totalAmount) / (data.numberOfGrams + validateData.numberOfGrams)
                    }

                    await StockMergedModel.update(updatedData, {
                        where: {
                            uid: validateData.uid,
                        },
                        transaction: t
                    }).catch(err => {
                        console.log("Error while updating in merged table", err.message);
                        throw err;
                    })
                }

                console.log("Transaction Completed")

                return response;
            })
        }
        catch (err) {
            throw err;
        }
    }

    async getGoldInvestmentHistory(payload) {
        try {
            const uid = payload;
            console.log(uid)
            const data = await GoldHistoryModel.findAll({
                where: {
                    uid: uid
                }
            }).catch(err => {
                console.log("Error while getting investment", err.message);
                throw createError.InternalServerError(Constants.SQL_ERROR);
            })
            return data;
        }
        catch (err) {
            throw err;
        }
    }

    async getGoldPriceValue() {
            const url = `https://api.metalpriceapi.com/v1/latest?api_key=${process.env.ACCESS_KEY_METALPRICEAPI}&base=XAU&currencies=INR`;
            console.log("Gold URL", url)

            const data = await axios.get(url).then(response => {
                return response.data
            }).catch(err => {
                reject(createError.InternalServerError("AXIOS ERROR"))
            })
            return data;
    }

    async viewGoldInvestment(payload) {
        try {
            const response = await GoldMergedModel.findOne({
                where: {
                    uid: payload
                }
            }).catch(err => {
                console.log("Error while fetching data", err.message);
                throw createError.InternalServerError(SQL_ERROR);
            })
            console.log('Number of grams:',response.numberOfGrams);
            let numberofGramsInMerged = response.numberOfGrams;
            const dataAx = await this.getGoldPriceValue();
            console.log('gold in view Gold:',dataAx.rates['INR']);

            let conversionGoldPriceToGrams = ( dataAx.rates['INR'] / 31.1034768 );
            let currentGoldInvestmentValue = (numberofGramsInMerged * conversionGoldPriceToGrams);
            console.log('current gold investment value:',currentGoldInvestmentValue);
            return currentGoldInvestmentValue;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = GoldRecordsService;