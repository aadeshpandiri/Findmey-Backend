const MutualFundsModel = require('../utils/Models/MutualFunds/MutualFundsModel')
const MutualFundsMergedModel = require('../utils/Models/MutualFunds/MutualFundsMergedModel')
const MutualFundsHistoryModel = require('../utils/Models/MutualFunds/MutualFundsHistoryModel')
const { mutualFundRecordSchema } = require('../utils/SchemaValidations/mutualFundValidation')
const axios = require('axios');

class MutualFundService {
    constructor() {

    }

    async saveQuantity(payload) {
        try {
            const validateData = await mutualFundRecordSchema.validateAsync(payload)
            console.log("Validated Data", validateData);

            return await DATA.CONNECTION.mysql.transaction(async (t) => {

                const data = await MutualFundsModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while creating new record", err.message)
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("SAved in Model")

                await MutualFundsHistoryModel.create(validateData, {
                    transaction: t
                }).catch(err => {
                    console.log("Error while creating new record in history table", err.message)
                    throw createError.InternalServerError(SQL_ERROR)
                })
                console.log("SAved in History Model")

                const findData = await MutualFundsMergedModel.findOne({
                    where: {
                        uid: validateData.uid,
                        schemeCode: validateData.schemeCode
                    },
                    transaction: t
                }).catch(err => {
                    console.log("Error while finding record in merged table", err.message);
                    throw createError.InternalServerError(SQL_ERROR)
                })

                if (!findData) {
                    await MutualFundsMergedModel.create(validateData, {
                        transaction: t
                    }).catch(err => {
                        console.log("Error while saving in merged table", err.message);
                        throw createError.InternalServerError(SQL_ERROR)
                    })
                }
                else {
                    const updatedData = {
                        ...validateData,
                        numberOfShares: findData.numberOfShares + validateData.numberOfShares,
                        totalAmount: findData.totalAmount + validateData.totalAmount,
                        perSharePrice: (findData.totalAmount + validateData.totalAmount) / (findData.numberOfShares + validateData.numberOfShares)
                    }
                    console.log(updatedData);
                    await MutualFundsMergedModel.update(updatedData, {
                        where: {
                            uid: validateData.uid,
                            schemeCode: validateData.schemeCode
                        },
                        transaction: t
                    }).catch(err => {
                        console.log("Error while updating in merged table", err.message);
                        throw createError.InternalServerError(SQL_ERROR)
                    })
                }
                return data;
            })
        }
        catch (err) {
            throw err;
        }
    }

    getFundsValue(data) {
        return new Promise(async (resolve, reject) => {
            const fundsData = []
            const idList = [];
            const nameList = [];
            const totalStocksList = []
            const totalInvestedAmount = []
            console.log(data.length);

            for (var i = 0; i < data.length; i++) {
                idList.push(data[i].schemeCode);
                totalStocksList.push(data[i].numberOfShares)
                totalInvestedAmount.push(data[i].totalAmount)
                nameList.push(data[i].schemeName);
            }

            for (var i = 0; i < idList.length; i++) {
                var url = `https://api.mfapi.in/mf/${idList[i]}`;
                console.log("URL", url);

                const data = await axios.get(url).then(response => {
                    return response.data
                }).catch(err => {
                    reject(createError.InternalServerError("AXIOS ERROR"))
                })

                const currentPrice = data["data"][0]["nav"];
                const currentValue = currentPrice * totalStocksList[i];

                fundsData.push({
                    schemeName: nameList[i],
                    schemeCode: idList[i],
                    currentTotalValue: currentValue,
                    totalInvestedAmount: totalInvestedAmount[i]
                })

            }
            resolve(fundsData)
        })
    }

    async viewMutualFundsList(payload) {
        try {
            const data = await MutualFundsMergedModel.findAll({
                where: {
                    uid: payload
                }
            }).catch(err => {
                console.log("Error while finding data", err.message);
                throw createError.InternalServerError(SQL_ERROR)
            })

            const result = await this.getFundsValue(data);

            return result;
        }
        catch (err) {
            throw err;
        }
    }
}
module.exports = MutualFundService;