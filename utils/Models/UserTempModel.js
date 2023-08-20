const Sequelize = require('sequelize')

const UserTempModel = global.DATA.CONNECTION.mysql.define("UserTempModel", {
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
    isEmailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false
    }
}, {
    tableName: "temp_users"
})

module.exports = UserTempModel;