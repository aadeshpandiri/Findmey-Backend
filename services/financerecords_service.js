const createError = require('http-errors')
const { SQL_ERROR } = require('../utils/Constants/response_messages')
const { Sequelize } = require('sequelize')
const axios = require('axios')
const { financeRecordSchema } = require('../utils/SchemaValidations/financevalidation')
const FinanceRecordModel = require('../utils/Models/Finance/FinanceRecordsModel')

class FinanceRecordsService {
    constructor() {

    }

    async addFinance(payload) {
        try {
            const validateData = await financeRecordSchema.validateAsync(payload);
            const newlyCreatedFinanceRecord = await FinanceRecordModel.create(validateData).catch(err => {
                console.log("Error while adding in finance table", err.message);
                throw createError.InternalServerError(SQL_ERROR);
            });
            return newlyCreatedFinanceRecord;
        } catch (err) {
            throw err;
        }
    }

    async getTotalExpense(payload) {
        try {
            const searchData = await DATA.CONNECTION.mysql.query(`SELECT IFNULL(SUM(shoppingValue + paymentValue + foodValue + othersValue),0) AS totalExpenses
            FROM finance_records where uid = ${payload.uid}`, {
                type: Sequelize.QueryTypes.SELECT
            }).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(SQL_ERROR)
            })
            let totalExpenseOutput = {
                totalExpense: searchData[0].totalExpenses
            }
            return totalExpenseOutput;
        } catch (err) {
            throw err;
        }
    }

    async getTotalIncome(payload) {
        try {
            const searchData = await DATA.CONNECTION.mysql.query(`SELECT IFNULL(SUM(incomeValue),0) AS totalIncome
            FROM finance_records where uid = ${payload.uid}`, {
                type: Sequelize.QueryTypes.SELECT
            }).catch(err => {
                console.log("Error during checking user", err.message)
                throw createError.InternalServerError(SQL_ERROR)
            })
            let totalIncomeOutput = {
                totalIncome: searchData[0].totalIncome
            }
            return totalIncomeOutput;
        } catch (err) {
            throw err;
        }
    }

    // Function to execute a query and log the results
    async executeQuery(query) {
        const [rows] = await DATA.CONNECTION.mysql.query(query);
        return (rows);
    }


    async getWholeExpenseData(payload) {
        try {
            // Calculate total sum
            const totalSumQuery = `SELECT IFNULL(SUM(shoppingValue + paymentValue + foodValue + othersValue),0) AS total_expense FROM finance_records where uid = ${payload.uid}`;

            // Calculate yearly sums
            const yearlySumQuery = `
                SELECT YEAR(date) AS year, IFNULL(SUM(shoppingValue + paymentValue + foodValue + othersValue),0) AS yearly_expense
                FROM finance_records where uid = ${payload.uid}
                GROUP BY YEAR(date)
                ORDER BY YEAR(date) DESC
                `;


            // Calculate monthly sums
            const monthlySumQuery = `
                SELECT YEAR(date) AS year, MONTH(date) AS month, IFNULL(SUM(shoppingValue + paymentValue + foodValue + othersValue),0) AS monthly_expense,
                IFNULL(SUM(shoppingValue),0) as shopping_monthly_expense , 
                IFNULL(SUM(paymentValue),0) as payment_monthly_expense , 
                IFNULL(SUM(foodValue),0) as food_monthly_expense , 
                IFNULL(SUM(othersValue),0) as others_monthly_expense  
                FROM finance_records where uid = ${payload.uid}
                GROUP BY YEAR(date), MONTH(date)
                ORDER BY YEAR(date) DESC, MONTH(date) DESC
                `;


            // Calculate weekly sums
            const weeklySumQuery = `
                SELECT YEAR(date) AS year, WEEK(date) AS week, IFNULL(SUM(shoppingValue + paymentValue + foodValue + othersValue),0) AS weekly_expense
                FROM finance_records where uid = ${payload.uid}
                GROUP BY YEAR(date), WEEK(date)
                ORDER BY YEAR(date) DESC, WEEK(date) DESC
                `;

            // Calculate total sum expense percentage 
            const totalPercentageSumQuery = `
            SELECT IFNULL(SUM(shoppingValue + paymentValue + foodValue + othersValue),0) AS total_expense ,
                IFNULL(( (SUM(shoppingValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as shopping_total_percentage,
                IFNULL(( (SUM(paymentValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as payment_total_percentage,
                IFNULL( ( (SUM(foodValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as food_total_percentage,
                IFNULL(( (SUM(othersValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as others_total_percentage
            FROM finance_records where uid = ${payload.uid}`
            ;

            // Calculate yearly sum expense percentage 
            const yearlyPercentageSumQuery = `
                SELECT YEAR(date) AS year, SUM(shoppingValue + paymentValue + foodValue + othersValue) AS yearly_expense,
                    IFNULL(( (SUM(shoppingValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as shopping_yearly_percentage,
                    IFNULL(( (SUM(paymentValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as payment_yearly_percentage,
                    IFNULL( ( (SUM(foodValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as food_yearly_percentage,
                    IFNULL(( (SUM(othersValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as others_yearly_percentage
                FROM finance_records where uid = ${payload.uid}
                GROUP BY YEAR(date)
                ORDER BY YEAR(date) DESC
                `;

            // Calculate monthly expense percentage
            const monthlyPercentageSumQuery = `
            SELECT YEAR(date) AS year, MONTH(date) AS month, SUM(shoppingValue + paymentValue + foodValue + othersValue) AS monthly_expense,
                IFNULL(( (SUM(shoppingValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as shopping_monthly_percentage,
                IFNULL(( (SUM(paymentValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as payment_monthly_percentage,
                IFNULL( ( (SUM(foodValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as food_monthly_percentage,
                IFNULL(( (SUM(othersValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as others_monthly_percentage
                FROM finance_records where uid = ${payload.uid}
                GROUP BY YEAR(date), MONTH(date)
                ORDER BY YEAR(date) DESC, MONTH(date) DESC
                `;

            // Calculate weekly sum expense percentage 
            const weeklyPercentageSumQuery = `
                SELECT YEAR(date) AS year, WEEK(date) AS week, SUM(shoppingValue + paymentValue + foodValue + othersValue) AS weekly_expense,
                    IFNULL(( (SUM(shoppingValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as shopping_weekly_percentage,
                    IFNULL(( (SUM(paymentValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as payment_weekly_percentage,
                    IFNULL( ( (SUM(foodValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as food_weekly_percentage,
                    IFNULL(( (SUM(othersValue)) / (SUM(shoppingValue + paymentValue + foodValue + othersValue)))*100,0) as others_weekly_percentage
                FROM finance_records where uid = ${payload.uid}
                GROUP BY YEAR(date), WEEK(date)
                ORDER BY YEAR(date) DESC, WEEK(date) DESC
                `;

            const totalExpenseArray = await this.executeQuery(totalSumQuery);
            const yearlyExpenseArray = await this.executeQuery(yearlySumQuery);
            const monthlyExpenseArray = await this.executeQuery(monthlySumQuery);
            const weeklyExpenseArray = await this.executeQuery(weeklySumQuery);

            const totalPercentageSumArray = await this.executeQuery(totalPercentageSumQuery);
            const yearlyPercentageSumArray = await this.executeQuery(yearlyPercentageSumQuery);
            const monthlyPercentageSumArray = await this.executeQuery(monthlyPercentageSumQuery);
            const weeklyPercentageSumArray = await this.executeQuery(weeklyPercentageSumQuery);

            let totalExpenseOutput = [{
                totalExpenseArray: totalExpenseArray[0],
                yearlyExpenseArray: yearlyExpenseArray,
                monthlyExpenseArray: monthlyExpenseArray,
                weeklyExpenseArray: weeklyExpenseArray,
                totalPercentageSumArray: totalPercentageSumArray[0],
                yearlyPercentageSumArray: yearlyPercentageSumArray[0],
                monthlyPercentageSumArray: monthlyPercentageSumArray[0],
                weeklyPercentageSumArray: weeklyPercentageSumArray[0]
            }]
            return totalExpenseOutput;
        } catch (err) {
            throw err;
        }


    }

    async getWholeIncomeData(payload) {
        try {
            // Calculate total sum
            const totalSumQuery = `SELECT SUM(incomeValue) AS total_income FROM finance_records where uid = ${payload.uid}`;

            // Calculate yearly sums
            const yearlySumQuery = `
                SELECT YEAR(date) AS year, IFNULL(SUM(incomeValue),0) AS yearly_income
                FROM finance_records where uid = ${payload.uid}
                GROUP BY YEAR(date)
                ORDER BY YEAR(date) DESC
                `;


            // Calculate monthly sums
            const monthlySumQuery = `
                SELECT YEAR(date) AS year, MONTH(date) AS month, IFNULL(SUM(incomeValue),0) AS monthly_income
                FROM finance_records where uid = ${payload.uid}
                GROUP BY YEAR(date), MONTH(date)
                ORDER BY YEAR(date) DESC, MONTH(date) DESC
                `;


            // Calculate weekly sums
            const weeklySumQuery = `
                SELECT YEAR(date) AS year, WEEK(date) AS week, IFNULL(SUM(incomeValue),0) AS weekly_income
                FROM finance_records where uid = ${payload.uid}
                GROUP BY YEAR(date), WEEK(date)
                ORDER BY YEAR(date) DESC, WEEK(date) DESC
                `;

                
            const totalIncomeArray = await this.executeQuery(totalSumQuery);
            const yearlyIncomeArray = await this.executeQuery(yearlySumQuery);
            const monthlyIncomeArray = await this.executeQuery(monthlySumQuery);
            const weeklyIncomeArray = await this.executeQuery(weeklySumQuery);

            let totalIncomeOutput = [{
                totalIncomeArray:totalIncomeArray[0],
                yearlyIncomeArray:yearlyIncomeArray[0],
                monthlyIncomeArray: monthlyIncomeArray,
                weeklyIncomeArray: weeklyIncomeArray[0],

        }]
            return totalIncomeOutput;
        } catch (err) {
            throw err;
        }


    }






}



module.exports = FinanceRecordsService;