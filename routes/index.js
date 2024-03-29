const AuthController = require('../controller/auth_controller')
const StocksController = require('../controller/stockrecords_controller')
const SavingsController = require('../controller/savingrecords_controller')
const ProvidentFundController = require('../controller/provident_fund_controller')
const MutualFundsController = require('../controller/mutual_fund_controller')
const GoldController = require('../controller/goldrecords_controller')
const BondController = require('../controller/bondrecords_controller')
const CustomTrackerController = require('../controller/custom_tracker_controller')
const DashboardController = require('../controller/dashboard_controller')
const FinanceController = require('../controller/financerecords_controller')

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
        this.app.use('/mutualFunds', MutualFundsController)
        this.app.use('/bond', BondController)
        this.app.use('/customTracker', CustomTrackerController)
        this.app.use('/dashboard', DashboardController)
        this.app.use('/finance', FinanceController)
    }
}

module.exports = IndexRoute;