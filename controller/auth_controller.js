const express = require('express')
const AuthService = require('../services/auth_service')
const Constants = require('../utils/Constants/response_messages')

const router = express.Router()

router.post('/register', async (req, res, next) => {
    try {
        const authServiceObj = new AuthService();
        const data = await authServiceObj.registerUser(req.body)
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
    // Yet to implement
})

module.exports = router;