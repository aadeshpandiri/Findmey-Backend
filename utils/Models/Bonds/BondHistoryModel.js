const Sequelize = require('sequelize')

const BondHistoryModel = global.DATA.CONNECTION.mysql.define("BondHistoryModel", {
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
    bondName: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    bondType: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    totalAmount: {
        type: Sequelize.FLOAT,
        allowNull: false
    }
}, {
    tableName: "bond_records_history"
})

module.exports = BondHistoryModel