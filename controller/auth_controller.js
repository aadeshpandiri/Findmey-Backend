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
            "message": Constants.SUCCESS,
            "id": data.dataValues
        })
    }
    catch (err) {
        if (err.isJoi === true) err.status = 400
        next(err)
    }
})

module.exports = router;