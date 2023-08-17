const moment = require('moment');
require('dotenv').config();

global.DATA = {
    CONNECTION: {
        mysql: undefined,
        redis: undefined
    },
    UTILS: {
        currentTimeStamp: function () {
            const currentDate = moment();
            return currentDate;
        },
    }
}

const MySQLConnection = require('./utils/Connections/mysql_connection')
const RedisConnection = require('./utils/Connections/redis_connection')

const initializeConnection = async () => {
    try {
        const connectionObjMySQL = new MySQLConnection();
        await connectionObjMySQL.initialize();

        const connectionObjRedis = new RedisConnection();
        await connectionObjRedis.initialize();

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

