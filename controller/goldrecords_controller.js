const express = require('express')
const JwtHelper = require('../utils/Helpers/jwt_helper')
const Constants = require('../utils/Constants/response_messages');
const GoldRecordsService = require('../services/goldrecords_service');

const router = express.Router()
const jwtHelperObj = new JwtHelper();

router.post('/saveGold', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const goldRecordServiceObj = new GoldRecordsService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await goldRecordServiceObj.saveGoldRecord(payload)
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

router.post('/editGold', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const goldRecordServiceObj = new GoldRecordsService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await goldRecordServiceObj.editGoldRecord(payload)
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

router.get('/getGoldInvestmentHistory', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const goldRecordServiceObj = new GoldRecordsService()
        const userId = parseInt(req.payload);
        const data = await goldRecordServiceObj.getGoldInvestmentHistory(userId)
            .catch(err => {
                throw err;
            })
        res.send({
            "status": 200,
            "message": Constants.SUCCESS,
            "data": data
        })
    }
    catch (err) {
        next(err);
    }
})

router.get('/viewGoldInvestment', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const goldRecordServiceObj = new GoldRecordsService()
        const userId = parseInt(req.payload);
        const data = await goldRecordServiceObj.viewGoldInvestment(userId)
            .catch(err => {
                console.log("Error occured", err.message);
                throw err;
            })
        res.send({
            "status": 200,
            "message": Constants.SUCCESS,
            "data": data
        })
    }
    catch (err) {
        next(err);
    }
})


module.exports = router;