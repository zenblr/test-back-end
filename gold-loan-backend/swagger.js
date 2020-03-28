const swaggerJSDoc = require("swagger-jsdoc");
const express = require("express");
const app = express();

const swaggerDefinition = {
    info: {
        swagger: "2.0",
        title: 'Gold Loan',
        description: 'Gold Loan APIs',
    },
    host: 'localhost:3000',
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
    apis: ['./routes/api_documentation/*.js'],
};

module.exports.swaggerSpec = swaggerJSDoc(options);
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});