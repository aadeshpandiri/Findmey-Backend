const express = require('express')
const BondRecordsService = require('../services/bondrecords_service')
const JwtHelper = require('../utils/Helpers/jwt_helper')
const Constants = require('../utils/Constants/response_messages')

const router = express.Router()
const jwtHelperObj = new JwtHelper();

router.post('/saveBond', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const bondRecordServiceObj = new BondRecordsService()
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await bondRecordServiceObj.saveBondRecord(payload)
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

router.post('/editBond', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const bondRecordServiceObj = new BondRecordsService()
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await bondRecordServiceObj.editBondRecord(payload)
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
        const bondRecordServiceObj = new BondRecordsService()
        const userId = parseInt(req.payload);
        const data = await bondRecordServiceObj.getInvestmentHistory(userId)
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

router.get('/viewBonds', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const bondRecordServiceObj = new BondRecordsService()
        const userId = parseInt(req.payload);
        const data = await bondRecordServiceObj.viewBonds(userId)
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

router.delete('/deleteBond', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const bondRecordServiceObj = new BondRecordsService()
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await bondRecordServiceObj.removeBond(payload)
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