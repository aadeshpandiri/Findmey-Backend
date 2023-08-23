const { stockRecordSchema } = require('../utils/SchemaValidations/stockvalidation')
const StockRecordsModel = require('../utils/Models/Stocks/StockRecordsModel')
const StockHistoryModel = require('../utils/Models/Stocks/StockHistoryModel')
const StockMergedModel = require('../utils/Models/Stocks/StockMergedModel')
const createError = require('http-errors')
const { SQL_ERROR } = require('../utils/Constants/response_messages')
const { Sequelize } = require('sequelize')
const axios = require('axios')

class StockRecordsService {
    constructor() {

    }

    async saveStockRecord(payload) {
        try {
            const validateData = await stockRecordSchema.validateAsync(payload)
            console.log("Validated Data", validateData);

            return await DATA.CONNECTION.mysql.transaction(async (t) => {

                const response = await StockHistoryModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while saving in history table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                console.log("Saved in History table")

                await StockRecordsModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while saving in stock records table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("Saved in Stock records table")

                let data = await StockMergedModel.findOne({
                    where: {
                        uid: validateData.uid,
                        stockSymbol: validateData.stockSymbol
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while finding record in merged model", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                if (!data) {
                    console.log('Newly adding in merged table')
                    data = await StockMergedModel.create(validateData, {
                        transaction: t
                    }).catch(err => {
                        console.log("Error while saving in merged table", err.message);
                        throw createError.InternalServerError(SQL_ERROR)
                    })
                }
                else {
                    const updatedData = {
                        ...validateData,
                        numberOfShares: data.numberOfShares + validateData.numberOfShares,
                        totalAmount: data.totalAmount + validateData.totalAmount,
                        perSharePrice: (data.totalAmount + validateData.totalAmount) / (data.numberOfShares + validateData.numberOfShares)
                    }

                    await StockMergedModel.update(updatedData, {
                        where: {
                            uid: validateData.uid,
                            stockSymbol: validateData.stockSymbol
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

    async editStockRecord(payload) {
        try {
            const validateData = await stockRecordSchema.validateAsync(payload)
            console.log("Validated Data", validateData);

            return await DATA.CONNECTION.mysql.transaction(async (t) => {

                const deleteRecord = await StockMergedModel.findOne({
                    where: {
                        uid: validateData.uid,
                        stockSymbol: validateData.stockSymbol
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while finding in merged table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                await StockMergedModel.destroy({
                    where: {
                        uid: validateData.uid,
                        stockSymbol: validateData.stockSymbol
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while deleting from merged table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                const historyPayload = {
                    uid: deleteRecord.uid,
                    stockSymbol: deleteRecord.stockSymbol,
                    stockName: deleteRecord.stockName,
                    totalAmount: -1 * (deleteRecord.totalAmount),
                    numberOfShares: -1 * (deleteRecord.numberOfShares),
                    perSharePrice: -1 * (deleteRecord.perSharePrice)
                }

                await StockHistoryModel.create(historyPayload, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while adding deleted record to history table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("Added in history table");

                await StockRecordsModel.destroy({
                    where: {
                        uid: validateData.uid,
                        stockSymbol: validateData.stockSymbol
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while deleting from records table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                });

                const response = await StockHistoryModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while saving in history table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                console.log("Saved in History table")

                await StockRecordsModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while saving in stock records table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("Saved in Stock records table")

                let data = await StockMergedModel.findOne({
                    where: {
                        uid: validateData.uid,
                        stockSymbol: validateData.stockSymbol
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while finding record in merged model", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                if (!data) {
                    console.log('Newly adding in merged table')
                    data = await StockMergedModel.create(validateData, {
                        transaction: t
                    }).catch(err => {
                        console.log("Error while saving in merged table", err.message);
                        throw createError.InternalServerError(SQL_ERROR)
                    })
                }
                else {
                    const updatedData = {
                        ...validateData,
                        numberOfShares: data.numberOfShares + validateData.numberOfShares,
                        totalAmount: data.totalAmount + validateData.totalAmount,
                        perSharePrice: (data.totalAmount + validateData.totalAmount) / (data.numberOfShares + validateData.numberOfShares)
                    }

                    await StockMergedModel.update(updatedData, {
                        where: {
                            uid: validateData.uid,
                            stockSymbol: validateData.stockSymbol
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
            const data = await StockHistoryModel.findAll({
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

    async getStockValue(stockList) {
        return new Promise(async (resolve, reject) => {
            const stockValueData = []
            const nameList = [];
            const totalStocksList = []
            const totalInvestedAmount = []
            const stockSymbol = []

            for (var i = 0; i < stockList.length; i++) {
                stockSymbol.push(stockList[i].stockSymbol);
                totalStocksList.push(stockList[i].numberOfShares);
                totalInvestedAmount.push(stockList[i].totalAmount)
                nameList.push(stockList[i].stockName)
            }

            for (var i = 0; i < nameList.length; i++) {
                const name = stockSymbol[i];
                const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${name}&apikey=${process.env.ACCESS_KEY_ALPHAVANTAGE}`;

                console.log("URL", url)

                const data = await axios.get(url).then(response => {
                    return response.data
                }).catch(err => {
                    reject(createError.InternalServerError("AXIOS ERROR"))
                })
                const currentPrice = data["Global Quote"]["05. price"];
                const currentValue = currentPrice * totalStocksList[i];

                stockValueData.push({
                    "stockSymbol": stockSymbol[i],
                    "stockName": nameList[i],
                    "currentTotalValue": currentValue,
                    "totalInvestedAmount": totalInvestedAmount[i],
                    "numberOfShares": totalStocksList[i]
                })
            }
            resolve(stockValueData)
        })
    }

    async viewStocks(payload) {
        try {
            const response = await StockMergedModel.findAll({
                where: {
                    uid: payload
                }
            }).catch(err => {
                console.log("Error while fetching data", err.message);
                throw createError.InternalServerError(SQL_ERROR);
            })

            const data = await this.getStockValue(response);
            console.log("View stocks result", data);
            return data;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = StockRecordsService;