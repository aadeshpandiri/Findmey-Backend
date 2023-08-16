const moment = require('moment');
require('dotenv').config();

global.DATA = {
    CONNECTION: {
        mysql: undefined
    },
    UTILS: {
        currentTimeStamp: function () {
            const currentDate = moment();
            return currentDate;
        },
    }
}

const MySQLConnection = require('./utils/Connections/mysql_connection')

const initializeConnection = async () => {
    try {
        const connectionObj = new MySQLConnection();
        await connectionObj.initialize();
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
};

async function startApp() {
    const Application = require('./app')
    const app = new Application()
    app.listen();
}

(async function () {
    await initializeConnection();
    await startApp()
})();

