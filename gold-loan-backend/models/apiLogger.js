module.exports = (sequelize, DataTypes) => {
    const ApiLogger = sequelize.define('api_logger', {
        userToken: {
            type: DataTypes.TEXT,
            field: 'user_token'
        },
        url: {
            type: DataTypes.STRING,
            field: 'url'
        },
        method: {
            type: DataTypes.STRING,
            field: 'method'
        },
        host: {
            type: DataTypes.STRING,
            field: 'host'
        },
        body: {
            type: DataTypes.JSON,
            field: 'body'
        },
        createdAt: {
            type: DataTypes.DATE
        }

    }, {
        freezeTableName: true,
        tableName: 'api_logger',
        timestamps: false
    });

    return ApiLogger;
}