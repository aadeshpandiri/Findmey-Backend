const AuthController = require('../controller/auth_controller')
const StocksController = require('../controller/stockrecords_controller')
const SavingsController = require('../controller/savingrecords_controller')
const ProvidentFundController = require('../controller/provident_fund_controller')
const GoldController = require('../controller/goldrecords_controller')

class IndexRoute {
    constructor(expressApp) {
        this.app = expressApp
    }

    async initialize() {
        this.app.use('/auth', AuthController)
        this.app.use('/stock', StocksController)
        this.app.use('/saving', SavingsController)
        this.app.use('/ppf', ProvidentFundController)
        this.app.use('/gold', GoldController)
    }
}

module.exports = IndexRoute;