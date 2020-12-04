require('custom-env').env(true)
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const cron = require('node-cron');
//importing swagger file
const swagger = require('./swagger');
const scrapSwagger = require('./scrapSwagger');
const digiGoldSwagger = require('./digiGoldSwagger')
// api logger middleware.
const apiLogger = require("./middleware/apiLogger");
const { cronForDailyPenalInterest, dailyIntrestCalculation } = require("./utils/interestCron");
//customer api logger middleware
const customerApiLogger = require("./middleware/customerApiLogger");
const json2xls = require('json2xls');
const getGoldSilverRate = require("./utils/digitalGoldSilverRates");
const merchantLogin = require('./utils/merchantLogin');
const customerKycStatusMessage = require("./utils/customerKycStatusMessage");
const withDrawStatusMessage = require("./utils/withDrawStatusMessage");
const {getErrorForMail} = require('./controllers/errorLogs/errorLogs');

//model
const models = require('./models');
const moment = require('moment')


var useragent = require('express-useragent');
 
var app = express();

app.use(useragent.express());

//swagger _setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger.swaggerSpec));

// app.use('/scrap/api-docs', swaggerUi.serve, swaggerUi.setup(scrapSwagger.swaggerSpec));

app.use('/digi-gold/api-docs', swaggerUi.serve, swaggerUi.setup(digiGoldSwagger.swaggerSpec));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json({ limit: '500mb' }));
app.use(cors());
app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '500mb',
    parameterLimit: 1000000
}));
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'templates')));

//middleware for apiLogger
app.use(apiLogger);
//For excel report
app.use(json2xls.middleware);
//middleware for customerApiLogger
app.use(customerApiLogger);

//index Route
var indexRouter = require('./routes/index');
app.use('/api', indexRouter);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {

    models.errorLogger.create({
        message: err.message,
        url: req.url,
        method: req.method,
        host: req.hostname,
        body: req.body,
        userData: req.userData
    })

    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.use(function (err, req, res, next) {
    res.status(500).send({ message: "something went wrong" });
});

// cron.schedule(' 0 */30 * * * *', async function () {
//     await getErrorForMail();
// })

// cron.schedule('0 1 * * *', async function () {
//     let date = moment()
//     var interestStartTime = moment();

//     try {
//         await dailyIntrestCalculation(date);
//         var interestEndTime = moment();
//         var interestProcessingTime = moment.utc(moment(interestEndTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(interestStartTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
//         await cronLogger("loan Interest", date, interestStartTime, interestEndTime, interestProcessingTime, "success", "success", null)

//         //penal interest cron
//         var penalStartTime = moment();
//         await penal(date, penalStartTime)

//     } catch (interestErr) {
//         var interestEndTime = moment();
//         var interestProcessingTime = moment.utc(moment(interestEndTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(interestStartTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
//         await cronLogger("loan Interest", date, interestStartTime, interestEndTime, interestProcessingTime, "failed", interestErr.message, null)

//         //penal interest cron
//         var penalStartTime = moment();
//         await penal(date, penalStartTime)

//     }
// })

// async function penal(date, penalStartTime) {
//     try {
//         await cronForDailyPenalInterest(date);
//         var penalEndTime = moment();
//         var penalProcessingTime = moment.utc(moment(penalEndTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(penalStartTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")

//         await cronLogger("loan Penal Interest", date, penalStartTime, penalEndTime, penalProcessingTime, "success", "success", null)
//     } catch (penalErr) {
//         var penalEndTime = moment();
//         var penalProcessingTime = moment.utc(moment(penalEndTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(penalStartTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
//         await cronLogger("loan Penal Interest", date, penalStartTime, penalEndTime, penalProcessingTime, "failed", penalErr.message, null)
//     }
// }

// cron.schedule('0,30 * * * * *', async () => {
//     let date = moment()
//     let startTime = moment();

//     try {
//         await getGoldSilverRate();
//         let endTime = moment();
//         let processingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(startTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS");
//         // await cronLogger("gold silver rate", date, startTime, endTime, processingTime, "success", "success", null);

//     } catch (err) {
//         console.log(err)
//         let endTime = moment();
//         var processingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(startTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
//         // await cronLogger("gold silver rate", date, startTime, endTime, processingTime, "failed", JSON.stringify(err.response.data), null)
//     }
// });

// // cron to update merchant token

// cron.schedule('0 3 * * *', async () => {
//     let date = moment();
//     let startTime = moment();

//     try {
//         await merchantLogin();
//         let endTime = moment();
//         let processingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(startTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS");
//         await cronLogger("merchant token", date, startTime, endTime, processingTime, "success", "success", null);

//     } catch (err) {
//         let endTime = moment();
//         var processingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(startTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
//         await cronLogger("merchant token ", date, startTime, endTime, processingTime, "failed", JSON.stringify(err.response.data), null)
//     }
// });

// //cron for customer kyc status

// cron.schedule('0 0 */1 * * *', async () => {
//     let date = moment()
//     let startTime = moment();

//     try {
//         await customerKycStatusMessage();
//         let endTime = moment();
//         let processingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(startTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS");
//         await cronLogger("customer kyc message", date, startTime, endTime, processingTime, "success", "success", null);

//     } catch (err) {
//         console.log(err)
//         let endTime = moment();
//         var processingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(startTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
//         await cronLogger("customer kyc message", date, startTime, endTime, processingTime, "failed", JSON.stringify(err.response.data), null)
//     }
// });

// //cron for withdraw status messsage

// cron.schedule('0 */30 * * * *', async () => {
//     let date = moment()
//     let startTime = moment();

//     try {
//         await withDrawStatusMessage();
//         let endTime = moment();
//         let processingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(startTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS");
//         await cronLogger("withdraw message", date, startTime, endTime, processingTime, "success", "success", null);

//     } catch (err) {
//         console.log(err)
//         let endTime = moment();
//         var processingTime = moment.utc(moment(endTime, "DD/MM/YYYY HH:mm:ss.SSS").diff(moment(startTime, "DD/MM/YYYY HH:mm:ss.SSS"))).format("HH:mm:ss.SSS")
//         await cronLogger("withdraw message", date, startTime, endTime, processingTime, "failed", JSON.stringify(err.response.data), null)
//     }
// });

async function cronLogger(cronType, date, startTime, endTime, processingTime, status, message, notes) {
    await models.cronLogger.create({ cronType, date, startTime, endTime, processingTime, status, message, notes })
}

module.exports = app;