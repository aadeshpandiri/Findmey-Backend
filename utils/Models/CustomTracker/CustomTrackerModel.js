const Sequelize = require('sequelize')

const CustomTrackerModel = DATA.CONNECTION.mysql.define("CustomTrackerModel", {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },
    uid: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    trackerName: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    investedAmount: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    valueTimeofInvestment: {
        type: Sequelize.FLOAT,
        allowNull: false
    },
    currentValue: {
        type: Sequelize.FLOAT,
        allowNull: false
    }
}, {
    tableName: "custom_trackers"
})

module.exports = CustomTrackerModel;