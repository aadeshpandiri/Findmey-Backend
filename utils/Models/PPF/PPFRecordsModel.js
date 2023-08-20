const Sequelize = require('sequelize')

const PPFRecordsModel = global.DATA.CONNECTION.mysql.define("PPFRecordModel", {
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
    ppfAmount: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: "ppf_records"
})

module.exports = PPFRecordsModel