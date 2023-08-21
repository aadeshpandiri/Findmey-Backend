const Sequelize = require('sequelize')

const MutualFundsMergedModel = global.DATA.CONNECTION.mysql.define("MutualFundsMergedModel", {
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
    perSharePrice: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    numberOfShares: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    schemeCode: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    schemeName: {
        type: Sequelize.STRING(500),
        allowNull: false
    }
}, {
    tableName: "mutual_fund_records_merged"
})

module.exports = MutualFundsMergedModel;