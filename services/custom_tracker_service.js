const { customTrackerSchema, customTrackerSchemaEdit } = require('../utils/SchemaValidations/customTracker')
const { SQL_ERROR } = require('../utils/Constants/response_messages')
const createError = require('http-errors')
const CustomTrackerModel = require('../utils/Models/CustomTracker/CustomTrackerModel');
const { Sequelize } = require('sequelize');

class CustomTrackerService {
    constructor() {

    }

    async createNewTracker(payload) {
        try {
            const validateData = await customTrackerSchema.validateAsync(payload);

            const getAllValues = await DATA.CONNECTION.mysql.query(`select count(id) as total from custom_trackers where uid = ${validateData.uid}`, {
                type: Sequelize.QueryTypes.SELECT
            }).catch(err => {
                console.log("Error while counting", err.message);
                throw createError.InternalServerError(SQL_ERROR)
            })
            console.log(getAllValues)

            if (getAllValues[0].total === 5) {
                throw createError.NotAcceptable("Tracker Limit Exceeded");
            }

            const isExists = await CustomTrackerModel.findOne({
                where: {
                    uid: validateData.uid,
                    trackerName: validateData.trackerName
                }
            }).catch(err => {
                console.log("error while checking name", err.message);
                throw createError.InternalServerError(SQL_ERROR)
            })

            if (isExists) {
                throw createError.Conflict("Tracker Name Already Exists");
            }
            else {

                const data = await CustomTrackerModel.create(validateData)
                    .catch(err => {
                        console.log("Error during creation", err.message);
                        throw createError.InternalServerError(SQL_ERROR)
                    })

                return data;
            }
        }
        catch (err) {
            throw err;
        }
    }

    async editTrackerName(payload) {
        try {

            const validateData = payload;
            const findOne = await CustomTrackerModel.findOne({
                where: {
                    uid: validateData.uid,
                    id: validateData.id
                }
            }).catch(err => {
                console.log("Error while updating the data", err.message);
                throw createError.InternalServerError(SQL_ERROR)
            })

            if (!findOne) {
                throw createError.NotFound("Tracker Not Found")
            }

            const isExists = await CustomTrackerModel.findOne({
                where: {
                    uid: validateData.uid,
                    trackerName: validateData.trackerName
                }
            }).catch(err => {
                console.log("error while checking name", err.message);
                throw createError.InternalServerError(SQL_ERROR)
            })

            if (isExists) {
                throw createError.Conflict("Tracker Name Already Exists");
            }

            await CustomTrackerModel.update(validateData, {
                where: {
                    uid: validateData.uid,
                    id: validateData.id
                }
            }).catch(err => {
                console.log("error while updating name", err.message);
                throw createError.InternalServerError(SQL_ERROR)
            })

            return "NAME UPDATED SUCCESSFULLY"
        }
        catch (err) {
            throw err;
        }
    }

    async editTrackerData(payload) {
        try {
            const validateData = await customTrackerSchemaEdit.validateAsync(payload);

            const findOne = await CustomTrackerModel.findOne({
                where: {
                    uid: validateData.uid,
                    id: validateData.id
                }
            }).catch(err => {
                console.log("Error while updating the data", err.message);
                throw createError.InternalServerError(SQL_ERROR)
            })

            if (!findOne) {
                throw createError.NotFound("Tracker Not Found")
            }

            await CustomTrackerModel.update(validateData, {
                where: {
                    uid: validateData.uid,
                    id: validateData.id
                }
            }).catch(err => {
                console.log("Error while updating the data", err.message);
                throw createError.InternalServerError(SQL_ERROR)
            })

            const data = await CustomTrackerModel.findOne({
                where: {
                    uid: validateData.uid,
                    id: validateData.id
                }
            }).catch(err => {
                console.log("Error while geting the data", err.message);
                throw createError.InternalServerError(SQL_ERROR)
            })

            return data;
        }
        catch (err) {
            throw err;
        }
    }

    async getTrackerData(payload) {
        try {
            const data = await CustomTrackerModel.findOne({
                where: {
                    uid: payload.uid,
                    id: payload.id
                }
            }).catch(err => {
                console.log("Error while fetching data", err.message);
                throw createError.InternalServerError(SQL_ERROR)
            })

            if (!data) {
                throw createError.NotFound("Tracker Not Found")
            }

            return data;
        }
        catch (err) {
            throw err;
        }
    }

    async deleteTracker(payload) {
        try {
            const data = await CustomTrackerModel.findOne({
                where: {
                    uid: payload.uid,
                    id: payload.id
                }
            }).catch(err => {
                console.log("Error while fetching data", err.message);
                throw createError.InternalServerError(SQL_ERROR)
            })

            if (!data) {
                throw createError.NotFound("Tracker Not Found for User");
            }
            await CustomTrackerModel.destroy({
                where: {
                    uid: payload.uid,
                    id: payload.id
                }
            }).catch(err => {
                console.log("Error while deleting data", err.message);
                throw createError.InternalServerError(SQL_ERROR)
            })

            return "DELETION SUCCESSFULL"
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = CustomTrackerService;