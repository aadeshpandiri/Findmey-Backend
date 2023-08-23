const Sequelize = require('sequelize')

const GoldRecordModel = global.DATA.CONNECTION.mysql.define("GoldRecordModel", {
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
    perGramPrice: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    numberOfGrams: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    totalAmount: {
        type: Sequelize.FLOAT,
        allowNull: false
    }
}, {
    tableName: "gold_records"
})

module.exports = GoldRecordModel