module.exports = (sequelize, DataTypes) => {
    const apiLogger = sequelize.define('apilogger', {
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
        tableName: 'apilogger',
        timestamps: false
    });

    return apiLogger;
}