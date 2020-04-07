module.exports = (sequelize, DataTypes) => {
    const ErrorLogger = sequelize.define('error_logger', {
        message: {
            type: DataTypes.STRING,
            field: 'message'
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
        userData: {
            type: DataTypes.JSON,
            field: 'user_data'
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: new Date()
        }

    }, {
        freezeTableName: true,
        tableName: 'error_logger',
        timestamps: false
    });

    return ErrorLogger;
}