const { SQL_ERROR } = require('../utils/Constants/response_messages')
const axios = require('axios');
const createError = require('http-errors')
const StockRecordsModel = require('../utils/Models/Stocks/StockRecordsModel');
const { Sequelize } = require('sequelize');

class DashboardService {
    constructor() {

    }

    getStocksDetails(data) {
        return new Promise(async (resolve, reject) => {
            let totalStockValue = 0;
            let totalCurrentValue = 0;
            for (var i = 0; i < data.length; i++) {
                console.log("Current data", data[i]);
                totalStockValue = totalStockValue + data[i].totalAmount
                const name = data[i].stockSymbol;
                const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${name}&apikey=${process.env.ACCESS_KEY_ALPHAVANTAGE}`;
                console.log("URL", url)
                const resdata = await axios.get(url).then(response => {
                    return response.data
                }).catch(err => {
                    reject(createError.InternalServerError("AXIOS ERROR"))
                })
                const currentPrice = resdata["Global Quote"]["05. price"];
                const currentValue = currentPrice * data[i].totalShares;

                totalCurrentValue = totalCurrentValue + currentValue
                console.log(data[i].totalAmount + "-" + name + "-" + totalCurrentValue)
            }
            const response = {
                "img": "Savings",
                "name": "Savings",
                "label": "Savings",
                "values": totalStockValue,
                "currentValues": totalCurrentValue,
                "percentage": ((totalCurrentValue - totalStockValue) / totalStockValue) * 100
            }
            resolve(response)
        })
    }

    async getStocksDetailsConcurrent(data) {
        return new Promise(async (resolve, reject) => {
            let totalStockValue = 0;
            let totalCurrentValue = 0;
            const promises = data.map(async (item) => {
                const name = item.stockSymbol;
                const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${name}&apikey=${process.env.ACCESS_KEY_ALPHAVANTAGE}`;
                console.log("URL", url);
                return axios.get(url).then(response => {
                    const resdata = response.data;
                    const currentPrice = resdata["Global Quote"]["05. price"];
                    const currentValue = currentPrice * item.totalShares;
                    return { currentValue, totalAmount: item.totalAmount };
                });
            });
            const promiseResult = await Promise.all(promises);
            console.log("Promise Result", promiseResult)

            for (var z = 0; z < promiseResult.length; z++) {
                totalStockValue = totalStockValue + promiseResult[z].totalAmount;
                totalCurrentValue = totalCurrentValue + promiseResult[z].currentValue
            }

            const response = {
                "img": "Stocks",
                "name": "Stocks",
                "label": "Stocks",
                "values": totalStockValue,
                "currentValues": totalCurrentValue,
                "percentage": ((totalCurrentValue - totalStockValue) / totalStockValue) * 100
            };
            resolve(response)
        });
    }

    getMutualFundDetails(data) {
        return new Promise(async (resolve, reject) => {
            let totalFundsValue = 0;
            let totalCurrentValue = 0;
            for (var i = 0; i < data.length; i++) {
                console.log("Current data", data[i]);
                totalFundsValue = totalFundsValue + data[i].totalAmount
                const name = data[i].schemeCode;

                var url = `https://api.mfapi.in/mf/${name}`;
                console.log("URL", url);
                const resdata = await axios.get(url).then(response => {
                    return response.data
                }).catch(err => {
                    reject(createError.InternalServerError("AXIOS ERROR"))
                })
                const currentPrice = resdata["data"][0]["nav"];
                const currentValue = currentPrice * data[i].totalShares;

                totalCurrentValue = totalCurrentValue + currentValue
                console.log(data[i].totalAmount + "-" + name + "-" + totalCurrentValue)
            }
            const response = {
                "img": "Funds",
                "name": "Mutual Funds",
                "label": "Mutual Funds",
                "values": totalFundsValue,
                "currentValues": totalCurrentValue,
                "percentage": ((totalCurrentValue - totalFundsValue) / totalFundsValue) * 100
            }
            resolve(response)
        })
    }

    async getMutualFundDetailsConcurrent(data) {
        return new Promise(async (resolve, reject) => {
            let totalFundsValue = 0;
            let totalCurrentValue = 0;
            const promises = data.map(async (item) => {
                const name = item.schemeCode;
                const url = `https://api.mfapi.in/mf/${name}`;
                console.log("URL", url);

                return axios.get(url).then(response => {
                    const resdata = response.data;
                    const currentPrice = resdata["data"][0]["nav"];
                    const currentValue = currentPrice * data[i].totalShares;
                    return { currentValue, totalAmount: item.totalAmount };
                });
            });
            const promiseResult = await Promise.all(promises);
            console.log("Promise Result", promiseResult)

            for (var z = 0; z < promiseResult.length; z++) {
                totalFundsValue = totalFundsValue + promiseResult[z].totalAmount;
                totalCurrentValue = totalCurrentValue + promiseResult[z].currentValue
            }

            const response = {
                "img": "Funds",
                "name": "Mutual Funds",
                "label": "Mutual Funds",
                "values": totalFundsValue,
                "currentValues": totalCurrentValue,
                "percentage": ((totalCurrentValue - totalFundsValue) / totalFundsValue) * 100
            }
            resolve(response)
        })
    }

    getBondsDetails(data) {
        return new Promise((resolve, reject) => {
            let totalBondsValue = 0;
            let totalCurrentValue = 0;
            for (var i = 0; i < data.length; i++) {
                console.log("Current data", data[i]);
                totalBondsValue = totalBondsValue + data[i].totalAmount;
                totalCurrentValue = totalCurrentValue + data[i].totalAmount;
                // If API comes, we need to find current price 
            }
            const response = {
                "img": "Bonds",
                "name": "Bonds",
                "label": "Bonds",
                "values": totalBondsValue,
                "currentValues": totalCurrentValue,
                "percentage": "NaN"
            }
            resolve(response)
        })
    }

    getSavingsDetails(data) {
        return new Promise((resolve, reject) => {
            const response = {
                "img": "Savings",
                "name": "Savings",
                "label": "Savings",
                "values": data[0].totalAmount,
                "currentValues": data[0].totalAmount,
                "percentage": "NaN"
            }
            resolve(response)
        })
    }

    getPPFDetails(data) {
        return new Promise((resolve, reject) => {
            const response = {
                "img": "PPF",
                "name": "PPF",
                "label": "PPF",
                "values": data[0].totalAmount,
                "currentValues": data[0].totalAmount,
                "percentage": "NaN"
            }
            resolve(response)
        })
    }

    getCustomTrackerDetails(data) {
        return new Promise((resolve, reject) => {
            const response = [];
            for (var i = 0; i < data.length; i++) {
                let currentRecord = {
                    "img": data[i].trackerName,
                    "id": data[i].id,
                    "name": data[i].trackerName,
                    "label": data[i].trackerName,
                    "values": data[0].investedAmount,
                    "currentValues": data[0].currentValue,
                    "percentage": ((data[0].currentValue - data[0].investedAmount) / data[0].investedAmount) * 100
                }
                response.push(currentRecord)
            }
            resolve(response);
        })
    }

    getGoldDetails(data) {
        return new Promise((resolve, reject) => {
            const response = {
                "img": "Gold",
                "name": "Gold",
                "label": "Gold",
                "values": data[0].investedAmount,
                "currentValues": data[0].totalAmount,
                "percentage": "NaN"
            }
            resolve(response)
        })
    }

    async getInvestmentDetails(userId) {
        try {
            const response = []
            return await DATA.CONNECTION.mysql.transaction(async (t) => {

                // Stocks Data
                const stockData = await DATA.CONNECTION.mysql.query(`select sum(totalAmount) as totalAmount, stockSymbol,sum(numberOfShares) as totalShares from stock_records where uid =:uid group by stockSymbol`, {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction: t,
                    replacements: {
                        uid: userId
                    }
                }).catch(err => {
                    console.log("Error with stock query", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("Stock Data", stockData)
                const stockDetails = await this.getStocksDetailsConcurrent(stockData)
                console.log("Stock Calculated Details", stockDetails)
                response.push(stockDetails)

                // Mutual Funds Data
                const fundsData = await DATA.CONNECTION.mysql.query(`select sum(totalAmount) as totalAmount, schemeCode, sum(numberOfShares) as totalShares from mutual_fund_records where uid =:uid group by schemeCode`, {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction: t,
                    replacements: {
                        uid: userId
                    }
                }).catch(err => {
                    console.log("Error with funds query", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                console.log("Funds Data", fundsData)
                const mutualFundsDetails = await this.getMutualFundDetailsConcurrent(fundsData)
                console.log("Funds Calculated Details", mutualFundsDetails)
                response.push(mutualFundsDetails)

                // Bonds Data
                const bondsData = await DATA.CONNECTION.mysql.query(`select sum(totalAmount) as totalAmount, bondName, "NA" as totalShares from bond_records where uid =:uid`, {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction: t,
                    replacements: {
                        uid: userId
                    }
                }).catch(err => {
                    console.log("Error with Bonds query", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                console.log("BondsData", bondsData)
                const bondDetails = await this.getBondsDetails(bondsData)
                console.log("Bonds Data Calculates", bondDetails)
                response.push(bondDetails)

                // Savings
                const savingsData = await DATA.CONNECTION.mysql.query(`select sum(savingsAmount) as totalAmount from saving_records where uid =:uid`, {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction: t,
                    replacements: {
                        uid: userId
                    }
                }).catch(err => {
                    console.log("Error with Savings Data query", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                console.log("Savings Data", savingsData)
                const savingsDataDetails = await this.getSavingsDetails(savingsData)
                console.log("Savings Data Calculates", savingsDataDetails)
                response.push(savingsDataDetails)

                // PPF
                const ppfData = await DATA.CONNECTION.mysql.query(`select sum(ppfAmount) as totalAmount from ppf_records where uid =:uid`, {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction: t,
                    replacements: {
                        uid: userId
                    }
                }).catch(err => {
                    console.log("Error with Savings Data query", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("PPF Data", ppfData)
                const ppfDetails = await this.getPPFDetails(ppfData)
                console.log("PPF Data Calculates", ppfDetails)
                response.push(ppfDetails)

                // Custom Trackers
                const customTrackerData = await DATA.CONNECTION.mysql.query(`select id, trackerName, investedAmount, currentValue from custom_trackers where uid =:uid`, {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction: t,
                    replacements: {
                        uid: userId
                    }
                }).catch(err => {
                    console.log("Error with Custom trackers Data query", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("Custom Tracker Data", customTrackerData)
                const customTrackerDetails = await this.getCustomTrackerDetails(customTrackerData)
                console.log("Custom Tracker Data Calculates", customTrackerDetails)
                for (var j = 0; j < customTrackerDetails.length; j++) {
                    response.push(customTrackerDetails[j])
                }

                // Gold Data
                const goldData = await DATA.CONNECTION.mysql.query(`select totalAmount, investedAmount from gold_records where uid =:uid`, {
                    type: Sequelize.QueryTypes.SELECT,
                    transaction: t,
                    replacements: {
                        uid: userId
                    }
                }).catch(err => {
                    console.log("Error with Gold Data query", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("Gold Data", goldData)
                const goldDataDetails = await this.getGoldDetails(goldData)
                console.log("Custom Tracker Data Calculates", goldDataDetails)
                response.push(goldDataDetails)

                return response;
            })
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = DashboardService;