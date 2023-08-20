const createError = require('http-errors')
const { SQL_ERROR } = require('../utils/Constants/response_messages')
const { Sequelize } = require('sequelize')
const axios = require('axios');
const { PPFRecordSchema } = require('../utils/SchemaValidations/PPFvalidation')
const PPFRecordModel = require('../utils/Models/PPF/PPFRecordsModel')

class PPFRecordsService {
    constructor() {

    }

    async addPPFInvestment(payload) {
        try {
            const validateData = await PPFRecordSchema.validateAsync(payload);

            // Check in PPFs table whether investment is present or not
            const data = await PPFRecordModel.findOne({
                where: {
                    uid: validateData.uid
                }
            }).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(SQL_ERROR)
            })

            if (!data) {
                // Item not found, create a new one
                const newlyCreatedPPFRecord = await PPFRecordModel.create(validateData).catch(err => {
                    console.log("Error while adding in PPF table", err.message);
                    throw createError.InternalServerError(SQL_ERROR);
                });

                return newlyCreatedPPFRecord;
            }

            console.log('existing PPFs:',data.ppfAmount);
            console.log('entered PPFs:',validateData.ppfAmount);

            //Item found , update this 
            const updatedExistingPPFRecord = await PPFRecordModel.update({ppfAmount : data.ppfAmount + validateData.ppfAmount}, {where: {
                uid: validateData.uid
            }});

            const searchData = await PPFRecordModel.findOne({where:{
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

    async removePPFInvestment(payload) {
        try {
            const validateData = await PPFRecordSchema.validateAsync(payload);

            // Check in PPFs table whether investment is present or not
            const data = await PPFRecordModel.findOne({
                where: {
                    uid: validateData.uid
                }
            }).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(SQL_ERROR)
            })

            if (!data) {
                // Item not found, then we cant delete PPFs so operation is wrong
                return "Wrong Operation Performed , Please Add your PPF Amount first then remove it";
            }


            //Item found , update this  
            //entered amount greater than current PPFs - wrong operation
            if(validateData.ppfAmount > data.ppfAmount){
                return "Wrong Operation Performed , you can't remove more amount than your current PPF";
            }

            //entered amount lesser than or equal to current PPF - proceed
            const updatedExistingPPFRecord = await PPFRecordModel.update({ppfAmount : data.ppfAmount - validateData.ppfAmount}, {where: {
                uid: validateData.uid
            }});

            const searchData = await PPFRecordModel.findOne({where:{
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

    async getTotalPPFInvestment(payload){
        try{
            const data = await PPFRecordModel.findOne({
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
            return data;
        }catch(err){
            throw err;
        }
    }

}

module.exports = PPFRecordsService;