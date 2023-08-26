const express = require('express')
const JwtHelper = require('../utils/Helpers/jwt_helper')
const Constants = require('../utils/Constants/response_messages');
const GoldRecordsService = require('../services/goldrecords_service');

const router = express.Router()
const jwtHelperObj = new JwtHelper();

router.post('/addGold', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const goldRecordServiceObj = new GoldRecordsService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await goldRecordServiceObj.addgoldInvestment(payload)
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

router.post('/removeGold', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const goldRecordServiceObj = new GoldRecordsService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await goldRecordServiceObj.removegoldInvestment(payload)
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


router.get('/getTotalGoldInvestmentPrice', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const goldRecordServiceObj = new GoldRecordsService();
        const payload = {
            "uid": parseInt(req.payload)
        }
        const data = await goldRecordServiceObj.getTotalGoldInvestment(payload)
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