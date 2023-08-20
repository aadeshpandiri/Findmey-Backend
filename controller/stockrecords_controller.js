const express = require('express')
const StockRecordsService = require('../services/stockrecords_service')
const JwtHelper = require('../utils/Helpers/jwt_helper')
const Constants = require('../utils/Constants/response_messages')

const router = express.Router()
const jwtHelperObj = new JwtHelper();

router.post('/saveStock', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const stockRecordServiceObj = new StockRecordsService()
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await stockRecordServiceObj.saveStockRecord(payload)
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

router.post('/editStock', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const stockRecordServiceObj = new StockRecordsService()
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await stockRecordServiceObj.editStockRecord(payload)
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

router.get('/getInvestmentHistory', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const stockRecordServiceObj = new StockRecordsService()
        const userId = parseInt(req.payload);
        const data = await stockRecordServiceObj.getInvestmentHistory(userId)
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

router.get('/viewStocks', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const stockRecordServiceObj = new StockRecordsService()
        const userId = parseInt(req.payload);
        const data = await stockRecordServiceObj.viewStocks(userId)
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