const express = require('express')
const StockRecordsService = require('../services/stockrecords_service')
const Constants = require('../utils/Constants/response_messages')

const router = express.Router()

router.post('/saveStock', async (req, res, next) => {
    try {
        const stockRecordServiceObj = new StockRecordsService()
        const data = await stockRecordServiceObj.saveStockRecord(req.body)
            .catch(err => {
                console.log("error", err.message);
                throw err;
            })

        res.send({
            "status": 201,
            "message": Constants.SUCCESS,
            "data": data
        })
    }
    catch (err) {
        if (err.isJoi === true) err.status = 400
        next(err);
    }
})

router.get('/getInvestementHistory/:uid', async (req, res, next) => {
    try {
        const stockRecordServiceObj = new StockRecordsService()
        const data = await stockRecordServiceObj.getInvestmentHistory(req.params.uid)
            .catch(err => {
                throw err;
            })
        res.send({
            "status": 200,
            "message": Constants.SUCCESS,
            "data": data
        })
    }
    catch (err) {
        next(err);
    }
})

router.get('/viewStocks/:uid', async (req, res, next) => {
    try {
        const stockRecordServiceObj = new StockRecordsService()
        const data = await stockRecordServiceObj.viewStocks(req.params.uid)
            .catch(err => {
                console.log("Error occured", err.message);
                throw err;
            })
        res.send({
            "status": 200,
            "message": Constants.SUCCESS,
            "data": data
        })
    }
    catch (err) {
        next(err);
    }
})



module.exports = router;