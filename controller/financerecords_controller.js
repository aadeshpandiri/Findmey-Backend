const express = require('express')
const JwtHelper = require('../utils/Helpers/jwt_helper')
const Constants = require('../utils/Constants/response_messages');
const FinanceRecordsService = require('../services/financerecords_service');

const router = express.Router()
const jwtHelperObj = new JwtHelper();

router.post('/addFinance', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const financeRecordServiceObj = new FinanceRecordsService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await financeRecordServiceObj.addFinance(payload)
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

router.post('/getTotalExpenses', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const financeRecordServiceObj = new FinanceRecordsService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await financeRecordServiceObj.getTotalExpense(payload)
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

router.post('/getTotalIncome', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const financeRecordServiceObj = new FinanceRecordsService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await financeRecordServiceObj.getTotalIncome(payload)
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

router.post('/getTotalWholeExpenseData', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const financeRecordServiceObj = new FinanceRecordsService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await financeRecordServiceObj.getWholeExpenseData(payload)
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

router.post('/getTotalWholeIncomeData', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const financeRecordServiceObj = new FinanceRecordsService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await financeRecordServiceObj.getWholeIncomeData(payload)
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