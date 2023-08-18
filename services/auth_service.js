const createError = require('http-errors')
const UserModel = require('../utils/Models/UserModel')
const Constants = require('../utils/Constants/response_messages')
const bcrypt = require('bcrypt')
const { loginSchema, registerSchema } = require('../utils/SchemaValidations/authvalidation')
const JwtHelper = require('../utils/Helpers/jwt_helper')

class AuthService {
    constructor() {
        this.jwtHelperObj = new JwtHelper();
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