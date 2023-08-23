const express = require('express')
const MutualFundService = require('../services/mutual_fund_service')
const JwtHelper = require('../utils/Helpers/jwt_helper')
const Constants = require('../utils/Constants/response_messages')

const router = express.Router()
const jwtHelperObj = new JwtHelper();

router.post('/saveQuantity', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const mutualFundObj = new MutualFundService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await mutualFundObj.saveQuantity(payload)
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

router.post('/editQuantity', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const mutualFundObj = new MutualFundService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await mutualFundObj.editQuantity(payload)
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
        const mutualFundObj = new MutualFundService();
        const userId = parseInt(req.payload);
        const data = await mutualFundObj.viewMutualFundsList(userId)
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

router.get('/viewMutualFunds', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const mutualFundObj = new MutualFundService()
        const userId = parseInt(req.payload);
        const data = await mutualFundObj.viewMutualFundsList(userId)
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