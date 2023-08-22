const express = require('express')
const CustomTrackerService = require('../services/custom_tracker_service')
const JwtHelper = require('../utils/Helpers/jwt_helper')
const Constants = require('../utils/Constants/response_messages')

const router = express.Router()
const jwtHelperObj = new JwtHelper();

router.post('/addTracker', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const customTrackerServiceObj = new CustomTrackerService()

        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }

        const data = await customTrackerServiceObj.createNewTracker(payload)
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

router.post('/editTrackerData', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const customTrackerServiceObj = new CustomTrackerService()

        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }

        const data = await customTrackerServiceObj.editTrackerData(payload)
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

router.post('/editTrackerName', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const customTrackerServiceObj = new CustomTrackerService()

        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }

        const data = await customTrackerServiceObj.editTrackerName(payload)
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
router.delete('/deleteTracker', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const customTrackerServiceObj = new CustomTrackerService()

        const payload = {
            ...req.body,
            "uid": parseInt(req.payload)
        }

        const data = await customTrackerServiceObj.deleteTracker(payload)
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

router.get('/getTrackerData/:trackerId', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const customTrackerServiceObj = new CustomTrackerService()

        const payload = {
            "id": req.params.trackerId,
            "uid": parseInt(req.payload)
        }

        const data = await customTrackerServiceObj.getTrackerData(payload)
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