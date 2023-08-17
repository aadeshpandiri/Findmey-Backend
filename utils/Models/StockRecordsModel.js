const Sequelize = require('sequelize')

const StockRecordModel = global.DATA.CONNECTION.mysql.define("StockRecordModel", {
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
    },
    created_at: {
        type: Sequelize.DATE,
        defaultValue: DATA.UTILS.currentTimeStamp()
    },
    modified_at: {
        type: Sequelize.DATE,
        defaultValue: DATA.UTILS.currentTimeStamp()
    }
}, {
    tableName: "stock_records"
})