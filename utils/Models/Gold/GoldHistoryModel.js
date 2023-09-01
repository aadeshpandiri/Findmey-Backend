const Sequelize = require('sequelize')

const GoldHistoryModel = global.DATA.CONNECTION.mysql.define("GoldHistoryModel", {
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
        type: Sequelize.FLOAT,
        allowNull: false
    },
    totalAmount: {
        type: Sequelize.FLOAT,
        allowNull: false
    }
}, {
    tableName: "gold_records_history"
})

module.exports = GoldHistoryModel