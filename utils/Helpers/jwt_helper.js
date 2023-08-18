const JWT = require('jsonwebtoken')
const createError = require('http-errors')
const Constants = require('../Constants/response_messages')

class JwtHelper {
    constructor() {

    }

    async generateAccessToken(tokenPayload) {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.ACCESS_TOKEN_SECRETKEY
            const options = {
                expiresIn: '1h',
                issuer: 'findemy.com',
                audience: tokenPayload,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError(Constants.JWT_SIGN_ERROR))
                    return
                }
                resolve(token)
            })
        })
    }

    generateRefreshToken(tokenPayload) {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.REFRESH_TOKEN_SECRETKEY
            const options = {
                expiresIn: '1y',
                issuer: 'findemy.com',
                audience: tokenPayload,
            }

            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError(Constants.JWT_SIGN_ERROR))
                }

                global.DATA.CONNECTION.redis.SET(tokenPayload, token)
                    .then(() => {
                        resolve(token)
                    })
                    .catch((err) => {
                        console.log(err.message)
                        reject(createError.InternalServerError(Constants.REDIS_ERROR))
                        return
                    })
            })
        })
    }

    verifyAccessToken(req, res, next) {
        console.log(req)
        if (!req.headers['authorization']) return next(createError.Unauthorized("Please provide token"))
        console.log("Reached here")
        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRETKEY, (err, payload) => {
            if (err) {
                return next(createError.Unauthorized("Token Invalid/Expired"))
            }
            req.payload = payload.aud
            next()
        })
    }
}

module.exports = JwtHelper;