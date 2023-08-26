const createError = require('http-errors')
const { SQL_ERROR } = require('../utils/Constants/response_messages')
const { Sequelize } = require('sequelize')
const axios = require('axios')
const { goldAddRecordSchema, goldRemoveRecordSchema } = require('../utils/SchemaValidations/goldvalidation')
const goldRecordModel = require('../utils/Models/Gold/GoldRecordsModel')

class GoldRecordsService {
    constructor() {

    }

    async addgoldInvestment(payload) {
        try {
            const validateData = await goldAddRecordSchema.validateAsync(payload);

            // Check in savings table whether investment is present or not
            const data = await goldRecordModel.findOne({
                where: {
                    uid: validateData.uid
                }
            }).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(SQL_ERROR)
            })

            if (!data) {
                // Item not found, create a new one
                const newlyCreatedGoldRecord = await goldRecordModel.create(validateData).catch(err => {
                    console.log("Error while adding in saving table", err.message);
                    throw createError.InternalServerError(SQL_ERROR);
                });
                let currentGoldValueOfMergedGold = await this.getGoldConversion(newlyCreatedGoldRecord.numberOfGrams);
                let goldOutput ={
                    "uid":newlyCreatedGoldRecord.uid,
                    "perGramPrice":newlyCreatedGoldRecord.perGramPrice,
                    "numberOfGrams":newlyCreatedGoldRecord.numberOfGrams,
                    "totalAmount":newlyCreatedGoldRecord.totalAmount,
                    "investedAmount":newlyCreatedGoldRecord.totalAmount,
                    "currentValue": currentGoldValueOfMergedGold
                }

                return goldOutput;
            }

            console.log('existing gold grams:',data.numberOfGrams);
            console.log('entered gold grams:',validateData.numberOfGrams);

            let currentGoldInvestment = await this.getGoldConversion(data.numberOfGrams);
            //Item found , update this 
            const updatedExistingGoldRecord = await goldRecordModel.update(
                {   numberOfGrams : data.numberOfGrams + validateData.numberOfGrams,
                    totalAmount:    currentGoldInvestment + validateData.totalAmount,
                    perGramPrice : (currentGoldInvestment + validateData.totalAmount)/(data.numberOfGrams + validateData.numberOfGrams),
                    investedAmount: currentGoldInvestment + validateData.totalAmount
                }
                , {where: {
                uid: validateData.uid
            }});

            const searchData = await goldRecordModel.findOne({where:{
                uid: validateData.uid
            }}).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(SQL_ERROR)
            })
            let currentGoldValueOfMergedGold = await this.getGoldConversion(searchData.numberOfGrams);

            let goldOutput ={
                "uid":searchData.uid,
                "perGramPrice":searchData.perGramPrice,
                "numberOfGrams":searchData.numberOfGrams,
                "totalAmount":searchData.totalAmount,
                "investedAmount":searchData.investedAmount,
                "currentValue": currentGoldValueOfMergedGold
            }
            return goldOutput;

        } catch (err) {
            throw err;
        }
    }

    async removegoldInvestment(payload) {
        try {
            const validateData = await goldRemoveRecordSchema.validateAsync(payload);

            // Check in savings table whether investment is present or not
            const data = await goldRecordModel.findOne({
                where: {
                    uid: validateData.uid
                }
            }).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(SQL_ERROR)
            })

            if (!data) {
                // Item not found, create a new one
                const newlyCreatedGoldRecord = await goldRecordModel.create(validateData).catch(err => {
                    console.log("Error while adding in saving table", err.message);
                    throw createError.InternalServerError(SQL_ERROR);
                });

                return newlyCreatedGoldRecord;
            }

            console.log('existing gold grams:',data.numberOfGrams);
            console.log('entered gold grams:',validateData.numberOfGrams);

            let numberofTotalGoldGramsPreviosly = data && data.numberOfGrams;
            let numberofTotalGoldGramsToBeRemoved = validateData && validateData.numberOfGrams;
            
            let currentGoldInvestmentValue = await this.getGoldConversion(numberofTotalGoldGramsPreviosly);
            let currentRemovedGoldInvestmentValue = await this.getGoldConversion(numberofTotalGoldGramsToBeRemoved);

             //Item found , update this 
             const updatedExistingGoldRecord = await goldRecordModel.update(
                {   numberOfGrams : data.numberOfGrams - validateData.numberOfGrams,
                    totalAmount: currentGoldInvestmentValue - currentRemovedGoldInvestmentValue,
                    perGramPrice : (currentGoldInvestmentValue - currentRemovedGoldInvestmentValue)/(data.numberOfGrams - validateData.numberOfGrams),
                    investedAmount:currentGoldInvestmentValue
                }
                , {where: {
                uid: validateData.uid
            }});

            const searchData = await goldRecordModel.findOne({where:{
                uid: validateData.uid
            }}).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(SQL_ERROR)
            })
            let currentGoldValueOfMergedGold = await this.getGoldConversion(searchData.numberOfGrams);
            let goldOutput ={
                "uid":searchData.uid,
                "perGramPrice":searchData.perGramPrice,
                "numberOfGrams":searchData.numberOfGrams,
                "totalAmount":searchData.totalAmount,
                "investedAmount":searchData.investedAmount,
                "currentValue":currentGoldValueOfMergedGold
            }
            return goldOutput;

        } catch (err) {
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

    async getGoldConversion(numberOfGramsPassed){
        const dataAx = await this.getGoldPriceValue();
        console.log('gold in view Gold:',);
        let conversionGoldPriceToGrams = ( dataAx.rates['INR'] / 31.1034768 );
        let currentGoldInvestmentValue = (numberOfGramsPassed * conversionGoldPriceToGrams);
        console.log('current gold investment value:',currentGoldInvestmentValue);
        return currentGoldInvestmentValue;
    }

    async getTotalGoldInvestment(payload){
        try{
            const data = await goldRecordModel.findOne({
                where: {
                    uid: payload.uid
                }
            }).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(SQL_ERROR)
            })

            if(!data){
                return "No Investment Found, Current savings = 0";
            }
            console.log('datain getgold:',data);
            console.log('data grams in getgold:',data.numberOfGrams);
            let numberofTotalGoldGrams = data && data.numberOfGrams;
            // const dataAx = await this.getGoldPriceValue();
            // console.log('gold in view Gold:',dataAx.rates['INR']);

            // let conversionGoldPriceToGrams = ( dataAx.rates['INR'] / 31.1034768 );
            // let currentGoldInvestmentValue = (numberofTotalGoldGrams * conversionGoldPriceToGrams);
            // console.log('current gold investment value:',currentGoldInvestmentValue);
            let currentGoldInvestmentValue;
            if(data){
                currentGoldInvestmentValue = await this.getGoldConversion(numberofTotalGoldGrams);
            }
            else{
                currentGoldInvestmentValue = 0;
            }
            let goldOutput ={
                "uid":data.uid,
                "perGramPrice":data.perGramPrice,
                "numberOfGrams":data.numberOfGrams,
                "totalAmount":data.totalAmount,
                "investedAmount":data.investedAmount,
                "currentGoldInvestmentPrice":currentGoldInvestmentValue
            }
            return goldOutput;
        }catch(err){
            throw err;
        }
    }
}

module.exports = GoldRecordsService;