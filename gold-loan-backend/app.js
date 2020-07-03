require('custom-env').env(true)
var createError = require('http-errors');
var express = require('express');
var path = require('path');
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

//importing swagger file
const swagger = require('./swagger');

// api logger middleware.
const apiLogger = require("./middleware/apiLogger");

//customer api logger middleware
const customerApiLogger = require("./middleware/customerApiLogger");

//model
const models = require('./models');



var app = express();

//swagger _setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swagger.swaggerSpec));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
        url:req.url,
        method:req.method,
        host: req.hostname,
        body:req.body,
        userData:req.userData
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

module.exports = app;