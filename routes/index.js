const AuthController = require('../controller/auth_controller')
const StocksController = require('../controller/stockrecords_controller')
class IndexRoute {
    constructor(expressApp) {
        this.app = expressApp
    }

    async initialize() {
        this.app.use('/auth', AuthController)
        this.app.use('/stock', StocksController)
    }
}

module.exports = IndexRoute;