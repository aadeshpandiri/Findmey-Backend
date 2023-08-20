const express = require('express')
const SavingRecordsService = require('../services/savingrecords_service');
const JwtHelper = require('../utils/Helpers/jwt_helper')
const Constants = require('../utils/Constants/response_messages')

const router = express.Router()
const jwtHelperObj = new JwtHelper();

router.post('/addSavings', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const savingRecordServiceObj = new SavingRecordsService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await savingRecordServiceObj.addSavingsInvestment(payload)
            .catch(err => {
                console.log("error", err.message);
                throw err;
            })

        res.send({
            "status": 201,
            "message": Constants.SUCCESS,
            "data": data
        })
    }
    catch (err) {
        if (err.isJoi === true) err.status = 400
        next(err);
    }
})

router.post('/removeSavings', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const savingRecordServiceObj = new SavingRecordsService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await savingRecordServiceObj.removeSavingsInvestment(payload)
            .catch(err => {
                console.log("error", err.message);
                throw err;
            })

        res.send({
            "status": 201,
            "message": Constants.SUCCESS,
            "data": data
        })
    }
    catch (err) {
        if (err.isJoi === true) err.status = 400
        next(err);
    }
})


router.get('/getTotalSavings', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const savingRecordServiceObj = new SavingRecordsService();
        const payload = {
            "uid": parseInt(req.payload)
        }
        const data = await savingRecordServiceObj.getTotalSavingsInvestment(payload)
            .catch(err => {
                console.log("error", err.message);
                throw err;
            })

        res.send({
            "status": 201,
            "message": Constants.SUCCESS,
            "data": data
        })
    }
    catch (err) {
        if (err.isJoi === true) err.status = 400
        next(err);
    }
})

module.exports = router;