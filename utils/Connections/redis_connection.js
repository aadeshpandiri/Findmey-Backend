const redis = require("async-redis");

class RedisConnection {
    constructor() {

    }
    async initialize() {
        await this.initializeDatabase();
    }

    async initializeDatabase() {
        try {

            let redisConnection = await redis.createClient({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT
            });

            redisConnection.on("connect", () => {
                console.log("Redis connection has been established successfully.");
            });

            redisConnection.on("error", (e) => {
                console.log("Something went wrong during redis connection " + e);
            });

            global.DATA.CONNECTION.redis = redisConnection;

        } catch (error) {
            console.error('Unable to connect to the Redis database:', error.message);
        }
    }
}

module.exports = RedisConnection;