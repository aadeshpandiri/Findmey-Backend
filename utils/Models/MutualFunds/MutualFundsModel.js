const Sequelize = require('sequelize')

const MutualFundsModel = global.DATA.CONNECTION.mysql.define("MutualFundsModel", {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    uid: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
    },
    totalAmount: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    schemeCode: {
        type: Sequelize.BIGINT,
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
    schemeName: {
        type: Sequelize.STRING(500),
        allowNull: false
    }
}, {
    tableName: "mutual_fund_records"
})

module.exports = MutualFundsModel;