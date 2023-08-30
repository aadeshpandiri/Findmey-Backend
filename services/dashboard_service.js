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
                "values": isNaN(totalStockValue) ? 0 : totalStockValue,
                "currentValues": isNaN(totalCurrentValue) ? 0 : totalCurrentValue,
                "percentage": isNaN(((totalCurrentValue - totalStockValue) / totalStockValue) * 100) ? 0 : ((totalCurrentValue - totalStockValue) / totalStockValue) * 100
            }
            resolve(response)
        })
    }

    async getStockDetailsConcurrent(stockList, userId) {
        let totalInvestedAmount = 0
        let totalCurrentValue = 0
        const promiseArray = []
        for (var i = 0; i < stockList.length; i++) {
            const name = stockList[i].stockSymbol;
            console.log(name);
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${name}&apikey=${process.env.ACCESS_KEY_ALPHAVANTAGE}`;
            console.log("URL", url);
            const storedStockData = await DATA.CONNECTION.redis.get(`${userId}_stocks_${name}`)
                .catch(err => {
                    console.log("Error with redisclient get", err);
                    throw createError.InternalServerError(Constants.REDIS_ERROR)
                })
            if (storedStockData == null) {
                const promise = axios.get(url)
                    .then(response => {
                        const data = response.data;
                        const currentPrice = data["Global Quote"]["05. price"];
                        console.log("Url Request made", url)
                        return {
                            "currentPrice": currentPrice,
                            "stockSymbol": name
                        };
                    })
                    .catch(err => {
                        throw createError.InternalServerError(SQL_ERROR);
                    });

                promiseArray.push(promise);
            }
        }
        const promiseData = await Promise.all(promiseArray).catch(err => {
            console.log("error", err.message);
            throw err;
        })
        // Store current prices in redis if not present
        for (var i = 0; i < promiseData.length; i++) {
            await DATA.CONNECTION.redis.set(`${userId}_stocks_${promiseData[i].stockSymbol}`, JSON.stringify(promiseData[i]), 'EX', 900)
                .catch(err => {
                    console.log("Error with redis", err.message);
                    throw createError.InternalServerError(Constants.REDIS_ERROR)
                })
        }
        // Response Calculation
        for (var i = 0; i < stockList.length; i++) {
            const stockSymbol = stockList[i].stockSymbol;
            const totalShares = stockList[i].totalShares;
            const totalAmount = stockList[i].totalAmount;
            const currentValue = await DATA.CONNECTION.redis.get(`${userId}_stocks_${stockSymbol}`)
                .catch(err => {
                    console.log("Error with redis", err.message);
                    throw createError.InternalServerError(Constants.REDIS_ERROR)
                })
            const parsedData = JSON.parse(currentValue);
            totalCurrentValue = totalCurrentValue + (parsedData.currentPrice * totalShares);
            totalInvestedAmount = totalInvestedAmount + totalAmount
            console.log(totalCurrentValue)
        }
        const response = {
            "img": "Stocks",
            "name": "Stocks",
            "label": "Stocks",
            "values": isNaN(totalInvestedAmount) ? 0 : totalInvestedAmount,
            "currentValues": isNaN(totalCurrentValue) ? 0 : totalCurrentValue,
            "percentage": isNaN(((totalCurrentValue - totalInvestedAmount) / totalInvestedAmount) * 100) ? 0 : ((totalCurrentValue - totalInvestedAmount) / totalInvestedAmount) * 100
        };
        return response;
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
                "values": isNaN(totalFundsValue) ? 0 : totalFundsValue,
                "currentValues": isNaN(totalCurrentValue) ? 0 : totalCurrentValue,
                "percentage": isNaN(((totalCurrentValue - totalFundsValue) / totalFundsValue) * 100) ? 0 : ((totalCurrentValue - totalFundsValue) / totalFundsValue) * 100
            }
            resolve(response)
        })
    }

    async getMutualFundDetailsConcurrent(fundsList, userId) {
        let totalInvestedAmount = 0
        let currentTotalValue = 0
        const promiseArray = [];
        for (var i = 0; i < fundsList.length; i++) {
            const name = fundsList[i].schemeCode;
            console.log(name);
            const url = `https://api.mfapi.in/mf/${name}`;
            console.log("URL", url);
            // Check if present in redis
            const fundsStoredData = await DATA.CONNECTION.redis.get(`${userId}_funds_${name}`)
                .catch(err => {
                    console.log("Error with redisclient get", err);
                    throw createError.InternalServerError(Constants.REDIS_ERROR)
                })
            if (fundsStoredData == null) {
                const promise = axios.get(url)
                    .then(response => {
                        const data = response.data;
                        const currentPrice = data["data"][0]["nav"];
                        console.log("Url Request made", url)
                        return {
                            "currentPrice": currentPrice,
                            "schemeCode": name
                        };
                    })
                    .catch(err => {
                        throw createError.InternalServerError(SQL_ERROR);
                    });

                promiseArray.push(promise);
            }
        }
        const promiseData = await Promise.all(promiseArray).catch(err => {
            console.log("error", err.message);
            throw err;
        })
        // Store current prices in redis if not present
        for (var i = 0; i < promiseData.length; i++) {
            await DATA.CONNECTION.redis.set(`${userId}_funds_${promiseData[i].schemeCode}`, JSON.stringify(promiseData[i]), 'EX', 900)
                .catch(err => {
                    console.log("Error with redis", err.message);
                    throw createError.InternalServerError(Constants.REDIS_ERROR)
                })
        }
        // calculate response
        for (var i = 0; i < fundsList.length; i++) {
            const schemeCode = fundsList[i].schemeCode;
            const totalShares = fundsList[i].totalShares;
            const totalAmount = fundsList[i].totalAmount;
            const currentValue = await DATA.CONNECTION.redis.get(`${userId}_funds_${schemeCode}`)
                .catch(err => {
                    console.log("Error with redis", err.message);
                    throw createError.InternalServerError(Constants.REDIS_ERROR)
                })
            const parsedData = JSON.parse(currentValue);
            const totalCurrentValue = parsedData.currentPrice * totalShares;
            totalInvestedAmount = totalInvestedAmount + totalAmount
            currentTotalValue = currentTotalValue + totalCurrentValue
        }
        const response = {
            "img": "Funds",
            "name": "Mutual Funds",
            "label": "Mutual Funds",
            "values": isNaN(totalInvestedAmount) ? 0 : totalInvestedAmount,
            "currentValues": isNaN(currentTotalValue) ? 0 : currentTotalValue,
            "percentage": isNaN(((currentTotalValue - totalInvestedAmount) / totalInvestedAmount) * 100) ? 0 : ((currentTotalValue - totalInvestedAmount) / totalInvestedAmount) * 100
        }
        return response;
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
                "values": isNaN(totalBondsValue) ? 0 : totalBondsValue,
                "currentValues": isNaN(totalCurrentValue) ? 0 : totalCurrentValue,
                "percentage": 0
            }
            resolve(response)
        })
    }

    getSavingsDetails(data) {
        return new Promise((resolve, reject) => {
            let response = null
            if (data.length > 0) {
                response = {
                    "img": "Savings",
                    "name": "Savings",
                    "label": "Savings",
                    "values": isNaN(data[0].totalAmount) ? 0 : data[0].totalAmount,
                    "currentValues": isNaN(data[0].totalAmount) ? 0 : data[0].totalAmount,
                    "percentage": 0
                }
            }
            else {
                response = {
                    "img": "Savings",
                    "name": "Savings",
                    "label": "Savings",
                    "values": 0,
                    "currentValues": 0,
                    "percentage": 0
                }
            }
            resolve(response)
        })
    }

    getPPFDetails(data) {
        return new Promise((resolve, reject) => {
            let response = null
            if (data.length > 0) {
                response = {
                    "img": "PPF",
                    "name": "PPF",
                    "label": "PPF",
                    "values": isNaN(data[0].totalAmount) ? 0 : data[0].totalAmount,
                    "currentValues": isNaN(data[0].totalAmount) ? 0 : data[0].totalAmount,
                    "percentage": 0
                }
            }
            else {
                response = {
                    "img": "PPF",
                    "name": "PPF",
                    "label": "PPF",
                    "values": 0,
                    "currentValues": 0,
                    "percentage": 0
                }
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
                    "percentage": isNaN(((data[0].currentValue - data[0].investedAmount) / data[0].investedAmount) * 100) ? 0 : ((data[0].currentValue - data[0].investedAmount) / data[0].investedAmount) * 100
                }
                response.push(currentRecord)
            }
            resolve(response);
        })
    }

    getGoldDetails(data) {
        return new Promise((resolve, reject) => {
            let response = null;
            if (data.length > 0) {
                response = {
                    "img": "Gold",
                    "name": "Gold",
                    "label": "Gold",
                    "values": isNaN(data[0].investedAmount) ? 0 : data[0].investedAmount,
                    "currentValues": isNaN(data[0].totalAmount) ? 0 : data[0].totalAmount,
                    "percentage": 0
                }
            }
            else {
                response = {
                    "img": "Gold",
                    "name": "Gold",
                    "label": "Gold",
                    "values": 0,
                    "currentValues": 0,
                    "percentage": 0
                }
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
                const stockDetails = await this.getStockDetailsConcurrent(stockData, userId)
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
                const mutualFundsDetails = await this.getMutualFundDetailsConcurrent(fundsData, userId)
                console.log("Funds Calculated Details", mutualFundsDetails)
                response.push(mutualFundsDetails)

                // Bonds Data
                const bondsData = await DATA.CONNECTION.mysql.query(`select totalAmount as totalAmount, bondName, "NA" as totalShares from bond_records where uid =:uid`, {
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
                const savingsData = await DATA.CONNECTION.mysql.query(`select savingsAmount as totalAmount from saving_records where uid =:uid`, {
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
                const ppfData = await DATA.CONNECTION.mysql.query(`select ppfAmount as totalAmount from ppf_records where uid =:uid`, {
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