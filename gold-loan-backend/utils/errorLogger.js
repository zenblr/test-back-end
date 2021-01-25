const models = require('../models');

module.exports = async (err, url, method, hostname, body)=>{
   
    let errorLogger = models.errorLogger.create({
        message: err,
        url: url,
        method: method,
        host: hostname,
        body: body
    })

    return errorLogger;
}