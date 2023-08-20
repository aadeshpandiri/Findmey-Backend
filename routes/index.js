const AuthController = require('../controller/auth_controller')
const StocksController = require('../controller/stockrecords_controller')
const SavingsController = require('../controller/savingrecords_controller')
class IndexRoute {
    constructor(expressApp) {
        this.app = expressApp
    }

    async initialize() {
        this.app.use('/auth', AuthController)
        this.app.use('/stock', StocksController)
        this.app.use('/saving', SavingsController)
    }
}

module.exports = IndexRoute;