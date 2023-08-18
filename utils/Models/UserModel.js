const Sequelize = require('sequelize')

const UserModel = global.DATA.CONNECTION.mysql.define("UserModel", {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    password: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    fullName: {
        type: Sequelize.STRING(100),
        allowNull: true
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: DATA.UTILS.currentTimeStamp()
    },
    isEmailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    modifiedAt: {
        type: Sequelize.DATE,
        defaultValue: DATA.UTILS.currentTimeStamp()
    },
    phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false
    }
}, {
    tableName: "users"
})

module.exports = UserModel;