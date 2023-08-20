const express = require('express')
const JwtHelper = require('../utils/Helpers/jwt_helper')
const Constants = require('../utils/Constants/response_messages');
const PPFRecordsService = require('../services/ppfrecords_service');

const router = express.Router()
const jwtHelperObj = new JwtHelper();

router.post('/addPPF', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const PPFRecordServiceObj = new PPFRecordsService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await PPFRecordServiceObj.addPPFInvestment(payload)
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

router.post('/removePPF', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const PPFRecordServiceObj = new PPFRecordsService();
        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }
        const data = await PPFRecordServiceObj.removePPFInvestment(payload)
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

router.get('/getTotalPPF', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const PPFRecordServiceObj = new PPFRecordsService();
        const payload = {
            "uid": parseInt(req.payload)
        }
        const data = await PPFRecordServiceObj.getTotalPPFInvestment(payload)
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