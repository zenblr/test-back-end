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
const scrapSwagger = require('./scrapSwagger')
// api logger middleware.
const apiLogger = require("./middleware/apiLogger");
const { cronForDailyPenalInterest, dailyIntrestCalculation } = require("./utils/interestCalculation");
//customer api logger middleware
const customerApiLogger = require("./middleware/customerApiLogger");

//model
const models = require('./models');
const moment = require('moment')



var app = express();

//swagger _setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger.swaggerSpec));

app.use('/scrap/api-docs', swaggerUi.serve, swaggerUi.setup(scrapSwagger.swaggerSpec));


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

// cron.schedule(' * * * * *', async function () {
//     await interest.test('1');
// })

cron.schedule('0 1 * * *', async function () {
    let date = moment()

    await dailyIntrestCalculation(date);
    await models.cronRun.create({ date: date, type: 'Interest' })

    await cronForDailyPenalInterest();
    await models.cronRun.create({ date: date, type: 'penal Interest' })
})

module.exports = app;