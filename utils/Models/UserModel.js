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
    fullname: {
        type: Sequelize.STRING(100),
        allowNull: true
    },
    created_at: {
        type: Sequelize.DATE,
        defaultValue: DATA.UTILS.currentTimeStamp()
    },
    modified_at: {
        type: Sequelize.DATE,
        defaultValue: DATA.UTILS.currentTimeStamp()
    },
    phone_number: {
        type: Sequelize.STRING(20),
        allowNull: false
    }
}, {
    tableName: "users"
})

module.exports = UserModel;