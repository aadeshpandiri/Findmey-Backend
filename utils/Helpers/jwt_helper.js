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
                expiresIn: '10m',
                issuer: 'findemy.com',
                audience: tokenPayload,
            }
            JWT.sign(payload, secret, options, (err, token) => {
                if (err) {
                    console.log(err.message)
                    reject(createError.InternalServerError(Constants.JWT_SIGN_ERROR))
                    return
                }
                console.log(`access${tokenPayload}`)
                global.DATA.CONNECTION.redis.SET(`access${tokenPayload}`, token)
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

    generateRefreshToken(tokenPayload) {
        return new Promise((resolve, reject) => {
            const payload = {}
            const secret = process.env.REFRESH_TOKEN_SECRETKEY
            const options = {
                expiresIn: '30m',
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
        if (!req.headers['authorization']) return next(createError.Unauthorized("Please provide token"))
        const authHeader = req.headers['authorization']
        const bearerToken = authHeader.split(' ')
        const token = bearerToken[1]
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRETKEY, (err, payload) => {
            if (err) {
                return next(createError.Unauthorized("Token Invalid/Expired"))
            }
            const userId = payload.aud
            console.log("Redis verify", `access${userId}`)
            DATA.CONNECTION.redis.get(`access${userId}`)
                .then(result => {
                    if (result === token) {
                        req.payload = userId;
                        next()
                    }
                    else {
                        next(createError.Unauthorized("Token Invalid/Expired"))
                    }
                })
                .catch(err => {
                    throw createError.InternalServerError(Constants.REDIS_ERROR)
                })
        })
    }

    verifyRefreshToken(refreshToken) {
        return new Promise((resolve, reject) => {
            JWT.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRETKEY,
                (err, payload) => {
                    if (err) return reject(createError.Unauthorized("Token Invalid/Expired"))
                    const userId = payload.aud

                    DATA.CONNECTION.redis.get(userId)
                        .then(result => {
                            if (refreshToken === result) return resolve(userId)
                            reject(createError.Unauthorized("Token Invalid/Expired"))
                        })
                        .catch(err => {
                            console.log("Error with redisclient get", err.mesasge);
                            throw createError.InternalServerError(Constants.REDIS_ERROR)
                        })
                }
            )
        })
    }
}

module.exports = JwtHelper;