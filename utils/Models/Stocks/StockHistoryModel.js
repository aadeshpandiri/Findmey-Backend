const Sequelize = require('sequelize')

const StockHistoryModel = global.DATA.CONNECTION.mysql.define("StockHistoryModel", {
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
    stockSymbol: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    stockName: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    perSharePrice: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    numberOfShares: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    totalAmount: {
        type: Sequelize.FLOAT,
        allowNull: false
    }
}, {
    tableName: "stock_records_history"
})

module.exports = StockHistoryModel