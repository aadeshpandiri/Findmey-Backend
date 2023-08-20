const createError = require('http-errors')
const { SQL_ERROR } = require('../utils/Constants/response_messages')
const { Sequelize } = require('sequelize')
const axios = require('axios')
const { savingRecordSchema } = require('../utils/SchemaValidations/savingvalidation')
const savingRecordModel = require('../utils/Models/savings/savingRecordsModel')

class SavingRecordsService {
    constructor() {

    }

    async addSavingsInvestment(payload) {
        try {
            const validateData = await savingRecordSchema.validateAsync(payload);

            // Check in savings table whether investment is present or not
            const data = await savingRecordModel.findOne({
                where: {
                    uid: validateData.uid
                }
            }).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(SQL_ERROR)
            })

            if (!data) {
                // Item not found, create a new one
                const newlyCreatedSavingRecord = await savingRecordModel.create(validateData).catch(err => {
                    console.log("Error while adding in saving table", err.message);
                    throw createError.InternalServerError(SQL_ERROR);
                });

                return newlyCreatedSavingRecord;
            }

            console.log('existing savings:',data.savingsAmount);
            console.log('entered savings:',validateData.savingsAmount);

            //Item found , update this 
            const updatedExistingSavingRecord = await savingRecordModel.update({savingsAmount : data.savingsAmount + validateData.savingsAmount}, {where: {
                uid: validateData.uid
            }});

            const searchData = await savingRecordModel.findOne({where:{
                uid: validateData.uid
            }}).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(SQL_ERROR)
            })
            return searchData;

        } catch (err) {
            throw err;
        }
    }

    async removeSavingsInvestment(payload) {
        try {
            const validateData = await savingRecordSchema.validateAsync(payload);

            // Check in savings table whether investment is present or not
            const data = await savingRecordModel.findOne({
                where: {
                    uid: validateData.uid
                }
            }).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(SQL_ERROR)
            })

            if (!data) {
                // Item not found, then we cant delete savings so operation is wrong
                return "Wrong Operation Performed , Please Add your savings first then remove it";
            }


            //Item found , update this  
            //entered amount greater than current savings - wrong operation
            if(validateData.savingsAmount > data.savingsAmount){
                return "Wrong Operation Performed , you can't remove more amount than your current savings";
            }

            //entered amount lesser than or equal to current savings - proceed
            const updatedExistingSavingRecord = await savingRecordModel.update({savingsAmount : data.savingsAmount - validateData.savingsAmount}, {where: {
                uid: validateData.uid
            }});

            const searchData = await savingRecordModel.findOne({where:{
                uid: validateData.uid
            }}).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(SQL_ERROR)
            })
            return searchData;

        } catch (err) {
            throw err;
        }
    }

}

module.exports = SavingRecordsService;