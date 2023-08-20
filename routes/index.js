const AuthController = require('../controller/auth_controller')
const StocksController = require('../controller/stockrecords_controller')
const SavingsController = require('../controller/savingrecords_controller')
const PPFController = require('../controller/PPFrecords_controller')

class IndexRoute {
    constructor(expressApp) {
        this.app = expressApp
    }

    async initialize() {
        this.app.use('/auth', AuthController)
        this.app.use('/stock', StocksController)
        this.app.use('/saving', SavingsController)
        this.app.use('/ppf', PPFController)
    }
}

module.exports = IndexRoute;