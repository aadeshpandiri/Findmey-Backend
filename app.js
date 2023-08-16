const express = require('express')
const bodyParser = require('body-parser')
const createError = require('http-errors')
const Constants = require('./utils/Constants/response_messages')
const IndexRoute = require('./routes/index')

class App {
    constructor() {
        this.app = express();
        this.intializeConfguration();
    }

    async intializeConfguration() {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.get("/hello", async (req, res, next) => {
            res.send({
                "status": 200,
                "message": Constants.SUCCESS
            })
        })
        // Use Routes after connection
        await new IndexRoute(this.app).initialize()

        // Handling Undefined route
        this.app.use(async (req, res, next) => {
            next(createError.NotFound("URL not found. Please enter valid URL"))
        })

        // Error Handler
        this.app.use((err, req, res, next) => {
            res.status(err.status || 500)
            res.send({
                "status": err.status || 500,
                "message": err.message
            })
        })
    }

    async listen() {
        this.app.listen(process.env.EXPRESS_PORT, (err) => {
            if (err) {
                console.log("Error while running the express application", err);
            }
            else {
                console.log(`Express application running on port ${process.env.EXPRESS_PORT}`);
            }
        })
    }

}
module.exports = App