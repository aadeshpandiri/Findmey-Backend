const Sequelize = require('sequelize')

const SavingRecordsModel = global.DATA.CONNECTION.mysql.define("SavingRecordModel", {
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
    savingsAmount: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "saving_records"
})

module.exports = SavingRecordsModel