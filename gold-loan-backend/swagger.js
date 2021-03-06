const swaggerJSDoc = require("swagger-jsdoc");
const express = require("express");
const app = express();


const swaggerDefinition = {
    info: {
        swagger: "2.0",
        title: 'Gold Loan',
        description: 'Gold Loan APIs',
    },
    host: process.env.BASE_URL_SWAGGER,
    basePath: '/api',
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'Authorization',
            scheme: 'jwt',
            in: 'header',
        },
    },
};
const options = {
    swaggerDefinition,
    apis: ['./routes/apiDocumentation/*.js'],
};

module.exports.swaggerSpec1 = swaggerJSDoc(options);
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec1);
});