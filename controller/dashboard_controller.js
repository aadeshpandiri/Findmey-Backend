const express = require('express')
const JwtHelper = require('../utils/Helpers/jwt_helper')
const Constants = require('../utils/Constants/response_messages')
const DashboardService = require('../services/dashboard_service')
const router = express.Router()
const jwtHelperObj = new JwtHelper();

router.get('/getDetails', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const dashboardServiceObj = new DashboardService()

        const data = await dashboardServiceObj.getInvestmentDetails(parseInt(req.payload))
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