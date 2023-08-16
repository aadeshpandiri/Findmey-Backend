const AuthController = require('../controller/auth_controller')
class IndexRoute {
    constructor(expressApp) {
        this.app = expressApp
    }

    async initialize() {
        this.app.use('/auth', AuthController)
    }
}

module.exports = IndexRoute;