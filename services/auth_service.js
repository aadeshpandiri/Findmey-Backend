const createError = require('http-errors')
const UserModel = require('../utils/Models/UserModel')
const UserTempModel = require('../utils/Models/UserTempModel')
const Constants = require('../utils/Constants/response_messages')
const bcrypt = require('bcrypt')
const { loginSchema, registerSchema } = require('../utils/SchemaValidations/authvalidation')
const JwtHelper = require('../utils/Helpers/jwt_helper')
var crypto = require("crypto");

class AuthService {
    constructor() {
        this.jwtHelperObj = new JwtHelper();
    }

    async registerUserTemp(payload) {
        try {
            const validPayload = await registerSchema.validateAsync(payload);

            // Check in users table: If present already registered
            const data = await UserModel.findOne({
                where: {
                    email: validPayload.email
                }
            }).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(Constants.SQL_ERROR)
            })
            if (data) {
                throw createError.Conflict("User Already Registered. Please Login")
            }

            // Check user in temp table. If exists do not add. If new user, add in temp table
            const tempData = await UserTempModel.findOne({
                where: {
                    email: validPayload.email
                }
            }).catch(err => {
                console.log("Error while finding in temp table", err.message);
                throw createError.InternalServerError(Constants.SQL_ERROR);
            })

            if (!tempData) {
                const password = validPayload.password;
                const randomkey = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, randomkey)
                const userPayload = {
                    email: validPayload.email,
                    password: hashedPassword,
                    phoneNumber: validPayload.phoneNumber,
                    isEmailVerified: 0,
                    fullName: validPayload.fullName
                }
                const newUser = await UserTempModel.create(userPayload).catch(err => {
                    console.log("Error while adding in temptable", err.message);
                    throw createError.InternalServerError(Constants.SQL_ERROR);
                });
                return newUser;
            }
            return tempData;
        }
        catch (err) {
            throw err;
        }
    }

    sendOtpToEmail(emailId, otp) {
        return new Promise((resolve, reject) => {
            const messageBody = {
                to: emailId,
                from: process.env.EMAIL_SENDER,
                subject: "Welcome to FINDEMY",
                text: `Welcome to FINDEMY. Your OTP for registration is ${otp}. 
                PLEASE DO NOT SHARE OTP WITH ANYONE. OTP is only valid for 2 Minutes`
            }

            global.DATA.UTILS.EMAILSENDER.send(messageBody).then(message => {
                console.log("Email Sent to the Mail");
                resolve("EMAIL SENT")
            }).catch(err => {
                console.log("Eror occured during email sending", err.message);
                reject(createError.InternalServerError("EMAIL DID NOT SENT"))
            })
        })
    }

    sendLinkToEmail(emailId, Link) {
        return new Promise((resolve, reject) => {
            const messageBody = {
                to: emailId,
                from: process.env.EMAIL_SENDER,
                subject: "Password Reset",
                html: `
                <html>
                    <head>
                        <style>
                            .button {
                                background-color: #4CAF50; /* Green */
                                border: none;
                                color: white;
                                padding: 10px 20px;
                                text-align: center;
                                text-decoration: none;
                                display: inline-block;
                                font-size: 16px;
                            }
                        </style>
                    <head>
                    <body>
                        <h2> Hello </h2>
                        <p>You recently requested to reset your password for your FINDEMY account. Use the below button to reset it. <span>
                        <b>This password reset link is only valid for the next 15 minutes.</b>
                        </span></p>
                        <p>If you did not request a password reset, please ignore this email or contact support if you have questions.
                        </p>

                        <p>
                            <a href = ${Link}> <button class = "button" > RESET YOUR PASSWORD </button> </a>
                        </p>    
                        <p>
                            Thanks, <br>
                            FINDEMY Team
                        </p>
                    </body>
                </html>
                `
            }

            global.DATA.UTILS.EMAILSENDER.send(messageBody).then(message => {
                console.log("Email Sent to the Mail");
                resolve("EMAIL SENT")
            }).catch(err => {
                console.log("Eror occured during email sending", err.message);
                reject(createError.InternalServerError("EMAIL DID NOT SENT"))
            })
        })
    }

    async sendOtp(payload) {
        try {
            const emailId = payload.email;
            const otp = Math.floor(1000 + Math.random() * 9000);
            console.log("Generated Random Otp Value", otp);

            // Code for sending otp to Email Id
            await this.sendOtpToEmail(emailId, otp);

            await DATA.CONNECTION.redis.set(`register_otp_${emailId}`, otp, 'EX', 180)
                .catch(err => {
                    console.log("Error with redis", err.message);
                    throw createError.InternalServerError(Constants.REDIS_ERROR)
                })

            console.log("Otp Saved in Redis")
            return Constants.OTP_SENT;
        }
        catch (err) {
            throw err;
        }
    }

    async verifyOtp(payload) {
        try {
            const emailId = payload.email;
            const otpProvided = payload.otp;

            const storedOTP = await DATA.CONNECTION.redis.get(`register_otp_${emailId}`)
                .catch(err => {
                    console.log("Error with redisclient get", err.mesasge);
                    throw createError.InternalServerError(Constants.REDIS_ERROR)
                })

            if (storedOTP === null) {
                console.log('OTP has expired or never existed');
                throw createError.BadRequest(Constants.OTP_EXPIRED)
            } else if (otpProvided === storedOTP) {
                console.log('OTP is correct');
            } else {
                console.log('Incorrect OTP');
                throw createError.BadRequest(Constants.OTP_INVALID)
            }

            // Otp is Verified. Delete record from temp table and store in users table
            await DATA.CONNECTION.mysql.transaction(async (t) => {

                const tempData = await UserTempModel.findOne({
                    where: {
                        email: emailId
                    },
                    transaction: t
                }).catch(err => {
                    console.log(err.mesasge);
                    throw createError.InternalServerError(Constants.SQL_ERROR)
                })

                const newUser = {
                    "email": tempData.email,
                    "password": tempData.password,
                    "phoneNumber": tempData.phoneNumber,
                    "isEmailVerified": 1,
                    "fullName": tempData.fullName
                }

                await UserTempModel.destroy({
                    where: {
                        email: emailId
                    },
                    transaction: t
                }).catch(err => {
                    console.log(err.mesasge);
                    throw createError.InternalServerError(Constants.SQL_ERROR)
                })
                console.log("User deleted from temp table")

                await UserModel.create(newUser, {
                    transaction: t
                }).catch(err => {
                    console.log(err.mesasge);
                    throw createError.InternalServerError(Constants.SQL_ERROR)
                })
                console.log("User added to new table")
            })
            return Constants.OTP_SUCCESS
        }
        catch (err) {
            throw err;
        }
    }

    async registerUser(payload) {
        try {
            const validateBody = await registerSchema.validateAsync(payload);
            const user = await UserModel.findOne({
                where: {
                    email: validateBody.email
                }
            }).catch(err => {
                throw createError.InternalServerError(Constants.SQL_ERROR)
            })

            if (user) {
                throw createError.Conflict(`${validateBody.email} has already been registered.`)
            }
            const password = validateBody.password;
            const randomkey = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, randomkey)

            const userPayload = {
                email: validateBody.email,
                password: hashedPassword,
                phone_number: validateBody.phone_number
            }

            const newUser = await UserModel.create(userPayload)
                .catch(err => {
                    throw createError.InternalServerError(Constants.SQL_ERROR)
                });

            return newUser;
        }
        catch (err) {
            throw err;
        }
    }

    async login(payload) {
        try {
            const validateBody = await loginSchema.validateAsync(payload);;

            const user = await UserModel.findOne({
                "where": {
                    email: validateBody.email
                }
            }).catch(err => {
                throw createError.InternalServerError(Constants.SQL_ERROR)
            })

            if (!user) {
                throw createError.NotFound("User Not Registered")
            }
            const userPassword = user.dataValues.password;

            const isValid = await bcrypt.compare(validateBody.password, userPassword);
            if (!isValid) {
                throw createError.Unauthorized("Email/Password not valid")
            }

            const tokenPayload = user.dataValues.id.toString()
            const accessToken = await this.jwtHelperObj.generateAccessToken(tokenPayload);

            const refreshToken = await this.jwtHelperObj.generateRefreshToken(tokenPayload);

            const data = {
                accessToken, refreshToken, "id": user.dataValues.id
            }
            return data
        }
        catch (err) {
            throw err;
        }
    }

    async generateNewAccessToken(refreshToken) {
        try {
            const userId = await this.jwtHelperObj.verifyRefreshToken(refreshToken);
            const accessToken = await this.jwtHelperObj.generateAccessToken(userId);
            const data = {
                "accessToken": accessToken
            }
            return data
        }
        catch (err) {
            throw err;
        }
    }

    logout(userId) {
        return new Promise((resolve, reject) => {
            const keys = [userId, `access${userId}`]
            DATA.CONNECTION.redis.DEL(keys)
                .then(result => {
                    console.log("redis delete refresh token", result)
                    resolve(Constants.LOGOUT_SUCCESS)
                })
                .catch(err => {
                    console.log(err.message)
                    reject(createError.InternalServerError(Constants.REDIS_ERROR))
                })
        })
    }

    forgotPassword(email) {
        return new Promise(async (resolve, reject) => {
            const data = await UserModel.findOne({
                where: {
                    email: email
                }
            }).catch(err => {
                console.log("Error during checking user", err.message)
                reject(createError.InternalServerError(Constants.SQL_ERROR))
                return;
            })
            if (!data) {
                reject(createError.NotFound("User Not Found"))
                return;
            }
            var uniqueKey = crypto.randomBytes(30).toString('hex');
            console.log("Unqiue key generated", uniqueKey)
            await DATA.CONNECTION.redis.set(uniqueKey, email, 'EX', 900)
                .catch(err => {
                    console.log("Error with redis", err.message);
                    reject(createError.InternalServerError(Constants.REDIS_ERROR))
                })
            const url = `http://findmey.in/forgotPassword/${uniqueKey}`

            await this.sendLinkToEmail(email, url);

            resolve("Email Sent to Mail Successfully")
        })
    }

    async changePassword(payload) {
        const key = payload.uniqueKey;
        const data = await DATA.CONNECTION.redis.get(key)
            .catch(err => {
                console.log("Error with redisclient get", err.mesasge);
                throw createError.InternalServerError(Constants.REDIS_ERROR)
            })
        if (data == null) {
            throw createError.NotFound("Invalid Link")
        }
        console.log("User forgot password email", data)

        const newPassword = payload.password;
        const randomkey = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, randomkey)

        await UserModel.update({
            password: hashedPassword
        }, {
            where: {
                email: data
            }
        }).catch(err => {
            console.log("Error while updating the password", err.message);
            throw err;
        })

        await DATA.CONNECTION.redis.del(key)
        return "Password Updated Successfully"
    }
}

module.exports = AuthService