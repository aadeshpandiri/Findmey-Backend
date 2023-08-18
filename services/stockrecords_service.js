const { stockRecordSchema } = require('../utils/SchemaValidations/stockvalidation')
const StockRecordsModel = require('../utils/Models/StockRecordsModel')
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
            const data = await StockRecordsModel.create(validateData)
                .catch(err => {
                    console.log("Error during creation", err.message);
                    throw createError.InternalServerError(SQL_ERROR);
                })
            return data;
        }
        catch (err) {
            throw err;
        }
    }

    async getInvestmentHistory(payload) {
        try {
            const uid = payload;
            console.log(uid)
            const data = await StockRecordsModel.findAll({
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
            const stockValueData = [];
            const nameList = [];
            const totalStocksList = []
            const totalInvestedAmount = []

            for (var i = 0; i < stockList.length; i++) {
                nameList.push(stockList[i].stockSymbol);
                totalStocksList.push(stockList[i].totalShares);
                totalInvestedAmount.push(stockList[i].mergedAmount)
            }

            for (var i = 0; i < nameList.length; i++) {
                const name = nameList[i];
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
                    "stockSymbol": nameList[i],
                    "currentTotalValue": currentValue,
                    "totalInvestedAmount": totalInvestedAmount[i]
                })
            }
            resolve(stockValueData)
        })
    }
    async viewStocks(payload) {
        try {
            const stockList = await DATA.CONNECTION.mysql.query(`select stockSymbol, sum(numberOfShares) as totalShares, sum(totalAmount) as mergedAmount from stock_records where uid = :uid group by stockSymbol`, {
                replacements: {
                    uid: payload
                },
                type: Sequelize.QueryTypes.SELECT
            }).catch(err => {
                console.log(err);
                throw err;
            })
            const data = await this.getStockValue(stockList)
            return data;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = StockRecordsService;