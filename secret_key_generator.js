const crypto = require('crypto')

/*
    FUNCTION ONLY FOR GENERATING NEW SECRET KEYS FOR TOKENS. 
    THIS FUNCTION IS NOT EXECUTED WHEN APPLICATION RUNS
*/
console.log("Token Generation Function Called")
const key1 = crypto.randomBytes(32).toString('hex')
const key2 = crypto.randomBytes(32).toString('hex')

console.log({ key1, key2 })