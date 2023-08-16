const createError = require('http-errors')
const UserModel = require('../utils/Models/UserModel')
const Constants = require('../utils/Constants/response_messages')
const bcrypt = require('bcrypt')
const { loginSchema, registerSchema } = require('../utils/SchemaValidations/authvalidation')

class AuthService {
    constructor() {

    }

    async registerUser(payload) {
        try {
            const validateBody = await registerSchema.validateAsync(payload);
            const user = await UserModel.findOne({
                where: {
                    email: validateBody.email
                }
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
                    throw createError.InternalServerError(Constants.ERROR_DURING_CREATION)
                });

            return newUser;
        }
        catch (err) {
            throw err;
        }
    }
}

module.exports = AuthService