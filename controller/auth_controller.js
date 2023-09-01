const express = require('express')
const createError = require('http-errors')
const AuthService = require('../services/auth_service')
const Constants = require('../utils/Constants/response_messages')
const JwtHelper = require('../utils/Helpers/jwt_helper')

const router = express.Router()
const jwtHelperObj = new JwtHelper();


router.post('/register', async (req, res, next) => {
    try {
        const authServiceObj = new AuthService();
        const data = await authServiceObj.registerUserTemp(req.body)
            .catch(err => {
                throw err;
            });
        res.send({
            "status": 201,
            "message": Constants.REGISTER_SUCCESS,
            "data": data
        })
    }
    catch (err) {
        if (err.isJoi === true) err.status = 400
        next(err)
    }
})

router.post('/sendOtp', async (req, res, next) => {
    try {
        const authServiceObj = new AuthService();
        const data = await authServiceObj.sendOtp(req.body)
            .catch(err => {
                throw err;
            });

        res.send({
            "status": 200,
            "message": data
        })
    }
    catch (err) {
        next(err);
    }
})

router.post('/verifyOtp', async (req, res, next) => {
    try {
        const authServiceObj = new AuthService();
        const data = await authServiceObj.verifyOtp(req.body)
            .catch(err => {
                throw err;
            });

        res.send({
            "status": 200,
            "message": data
        })
    }
    catch (err) {
        next(err);
    }
})


router.post('/login', async (req, res, next) => {
    try {
        const authServiceObj = new AuthService();

        const data = await authServiceObj.login(req.body)
            .catch(err => {
                throw err;
            });

        res.send({
            "status": 200,
            "message": Constants.LOGIN_SUCCESS,
            "data": data
        })

    }
    catch (err) {
        if (err.isJoi === true) err.status = 400
        next(err)
    }
})

router.post("/generateNewToken", async (req, res, next) => {
    try {
        const refreshToken = req.body.refreshToken ? req.body.refreshToken : "";
        const authServiceObj = new AuthService();
        console.log(refreshToken)
        if (!refreshToken) {
            throw createError.BadRequest("Refresh token cannot be empty")
        }
        const data = await authServiceObj.generateNewAccessToken(refreshToken)
            .catch(err => {
                throw err;
            })

        res.send({
            "status": 200,
            "message": "Token Generated",
            "data": data
        })
    }
    catch (err) {
        next(err);
    }
})

router.delete('/logout', jwtHelperObj.verifyAccessToken, async (req, res, next) => {
    try {
        const authServiceObj = new AuthService();
        const userId = parseInt(req.payload);
        const data = await authServiceObj.logout(userId)
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

router.post('/forgotPassword', async (req, res, next) => {
    try {
        const email = req.body.email;
        const authServiceObj = new AuthService();
        const data = await authServiceObj.forgotPassword(email)
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

router.post('/updatePassword', async (req, res, next) => {
    try {
        const payload = req.body;
        const authServiceObj = new AuthService();
        const data = await authServiceObj.changePassword(payload)
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

module.exports = router;