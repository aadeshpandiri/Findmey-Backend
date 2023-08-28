const Sequelize = require('sequelize')

const FinanceRecordModel = global.DATA.CONNECTION.mysql.define("FinanceRecordModel", {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    uid: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false
    },
    modeOfOperation: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    incomeValue: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    shoppingValue: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    paymentValue: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    foodValue: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    othersValue: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
}, {
    tableName: "finance_records"
})

module.exports = FinanceRecordModel