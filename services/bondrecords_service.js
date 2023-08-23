const { bondRecordSchema } = require('../utils/SchemaValidations/bondvalidation')
const BondRecordsModel = require('../utils/Models/Bonds/BondRecordsModel')
const BondHistoryModel = require('../utils/Models/Bonds/BondHistoryModel')
const BondMergedModel = require('../utils/Models/Bonds/BondMergedModel')
const createError = require('http-errors')
const { SQL_ERROR } = require('../utils/Constants/response_messages')
const { Sequelize } = require('sequelize')
const axios = require('axios')

class BondRecordsService {
    constructor() {

    }

    async saveBondRecord(payload) {
        try {
            const validateData = await bondRecordSchema.validateAsync(payload)
            console.log("Validated Data", validateData);

            return await DATA.CONNECTION.mysql.transaction(async (t) => {

                const response = await BondHistoryModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while saving in history table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                console.log("Saved in History table")

                await BondRecordsModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while saving in Bond records table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("Saved in Bond records table")

                let data = await BondMergedModel.findOne({
                    where: {
                        uid: validateData.uid,
                        bondName: validateData.bondName,
                        bondType: validateData.bondType
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while finding record in merged model", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                if (!data) {
                    console.log('Newly adding in merged table')
                    data = await BondMergedModel.create(validateData, {
                        transaction: t
                    }).catch(err => {
                        console.log("Error while saving in merged table", err.message);
                        throw createError.InternalServerError(SQL_ERROR)
                    })
                }
                else {
                    const updatedData = {
                        ...validateData,
                        totalAmount: data.totalAmount + validateData.totalAmount,
                    }

                    await BondMergedModel.update(updatedData, {
                        where: {
                            uid: validateData.uid,
                            bondName: validateData.bondName,
                            bondType: validateData.bondType
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

    async editBondRecord(payload) {
        try {
            const validateData = await bondRecordSchema.validateAsync(payload)
            console.log("Validated Data", validateData);

            return await DATA.CONNECTION.mysql.transaction(async (t) => {

                const deleteRecord = await BondMergedModel.findOne({
                    where: {
                        uid: validateData.uid,
                        bondName: validateData.bondName,
                        bondType: validateData.bondType
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while finding in merged table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                await BondMergedModel.destroy({
                    where: {
                        uid: validateData.uid,
                        bondName: validateData.bondName,
                        bondType: validateData.bondType
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while deleting from merged table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                const historyPayload = {
                    uid: deleteRecord.uid,
                    bondName: deleteRecord.bondName,
                    bondType: deleteRecord.bondType,    
                    totalAmount: -1 * (deleteRecord.totalAmount),
                }

                await BondHistoryModel.create(historyPayload, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while adding deleted record to history table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("Added in history table");

                await BondRecordsModel.destroy({
                    where: {
                        uid: validateData.uid,
                        bondName: validateData.bondName,
                        bondType: validateData.bondType,
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while deleting from records table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                });

                const response = await BondHistoryModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while saving in history table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                console.log("Saved in History table")

                await BondRecordsModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while saving in Bond records table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("Saved in Bond records table")

                let data = await BondMergedModel.findOne({
                    where: {
                        uid: validateData.uid,
                        bondName: validateData.bondName,
                        bondType: validateData.bondType,
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while finding record in merged model", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                if (!data) {
                    console.log('Newly adding in merged table')
                    data = await BondMergedModel.create(validateData, {
                        transaction: t
                    }).catch(err => {
                        console.log("Error while saving in merged table", err.message);
                        throw createError.InternalServerError(SQL_ERROR)
                    })
                }
                else {
                    const updatedData = {
                        ...validateData,
                        totalAmount: data.totalAmount + validateData.totalAmount,
                    }

                    await BondMergedModel.update(updatedData, {
                        where: {
                            uid: validateData.uid,
                            bondName: validateData.bondName,
                            bondType: validateData.bondType,
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

    async getInvestmentHistory(payload) {
        try {
            const uid = payload;
            console.log(uid)
            const data = await BondHistoryModel.findAll({
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

    async getBondValue(BondList) {
        return new Promise(async (resolve, reject) => {
            const BondValueData = []
            const nameList = [];
            const totalBondsList = []
            const totalInvestedAmount = []
            const bondType = []

            for (var i = 0; i < BondList.length; i++) {
                bondType.push(BondList[i].bondType);
                totalInvestedAmount.push(BondList[i].totalAmount)
                nameList.push(BondList[i].bondName)
            }

            for (var i = 0; i < nameList.length; i++) {
                // const name = BondSymbol[i];
                // const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${name}&apikey=${process.env.ACCESS_KEY_ALPHAVANTAGE}`;

                // console.log("URL", url)

                // const data = await axios.get(url).then(response => {
                //     return response.data
                // }).catch(err => {
                //     reject(createError.InternalServerError("AXIOS ERROR"))
                // })
                // const currentPrice = data["Global Quote"]["05. price"];

                //change
                // const currentValue = currentPrice * totalBondsList[i];
                const currentValue = totalInvestedAmount[i];

                BondValueData.push({
                    "bondType": bondType[i],
                    "bondName": nameList[i],
                    "currentTotalValue": currentValue,
                    "totalInvestedAmount": totalInvestedAmount[i],
                })
            }
            resolve(BondValueData)
        })
    }

    async viewBonds(payload) {
        try {
            const response = await BondMergedModel.findAll({
                where: {
                    uid: payload
                }
            }).catch(err => {
                console.log("Error while fetching data", err.message);
                throw createError.InternalServerError(SQL_ERROR);
            })

            const data = await this.getBondValue(response);
            console.log("View Bonds result", data);
            return data;
        }
        catch (err) {
            throw err;
        }
    }

    async removeBond(payload) {
        try {
            const deleteRecord = await BondMergedModel.findOne({
                where: {
                    uid: payload.uid,
                    bondName: payload.bondName,
                    bondType: payload.bondType,
                }
            }).catch(err => {
                console.log("Error while fetching from merged model", err.message);
                throw createError.InternalServerError(SQL_ERROR)
            })

            if (!deleteRecord) {
                throw createError.NotFound("Bonds Not Found")
            }

            return await DATA.CONNECTION.mysql.transaction(async (t) => {

                // Delete from merged table
                await BondMergedModel.destroy({
                    where: {
                        uid: payload.uid,
                        bondName: payload.bondName,
                        bondType: payload.bondType,
                    }
                }).catch(err => {
                    console.log("Error while deleting from merged model", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                await BondRecordsModel.destroy({
                    where: {
                        uid: payload.uid,
                        bondName: payload.bondName,
                        bondType: payload.bondType,
                    }
                }).catch(err => {
                    console.log("Error while deleting from Bonds model", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                const historyPayload = {
                    uid: deleteRecord.uid,
                    bondName: deleteRecord.bondName,
                    bondType: deleteRecord.bondType,
                    totalAmount: -1 * (deleteRecord.totalAmount),
                }

                await BondHistoryModel.create(historyPayload, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while adding deleted record to history table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("Added in history table");

                return "DELETION SUCCESSFULL"
            })
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = BondRecordsService;