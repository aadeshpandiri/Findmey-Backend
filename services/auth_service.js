const createError = require('http-errors')
const UserModel = require('../utils/Models/UserModel')
const UserTempModel = require('../utils/Models/UserTempModel')
const Constants = require('../utils/Constants/response_messages')
const bcrypt = require('bcrypt')
const { loginSchema, registerSchema } = require('../utils/SchemaValidations/authvalidation')
const JwtHelper = require('../utils/Helpers/jwt_helper')

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
                    isEmailVerified: 0
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

    async sendOtp(payload) {
        try {
            const emailId = payload.email;
            const otp = payload.id + "2023"
            console.log("Generated Otp Value", otp);

            // Code for sending otp to Email Id

            await DATA.CONNECTION.redis.set(`register_otp_${emailId}`, otp, 'EX', 120)
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
}

module.exports = AuthService