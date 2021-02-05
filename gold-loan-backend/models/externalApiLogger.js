module.exports = (sequelize, DataTypes) => {
    const ExternalApiLogger = sequelize.define('externalApiLogger', {
        // attributes
        apiType: {
            type: DataTypes.STRING,
            field: 'api_type'
        },
        userId: {
            type: DataTypes.STRING,
            field: 'user_id'
        },
        customerId: {
            type: DataTypes.STRING,
            field: 'customer_id'
        },
        api: {
            type: DataTypes.STRING,
            field: 'api'
        },
        request: {
            type: DataTypes.TEXT,
            field: 'request'
        },
        response: {
            type: DataTypes.TEXT,
            field: 'response'
        },
        status: {
            type: DataTypes.STRING,
            field: 'status'
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'external_api_logger'
    });

    return ExternalApiLogger;
}