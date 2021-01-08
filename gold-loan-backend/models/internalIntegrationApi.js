module.exports = (sequelize, DataTypes) => {
    const InternalIntegrationApi = sequelize.define('internalIntegrationApi', {
        // attributes
        secretKey: {
            type: DataTypes.STRING,
            field: 'secret_key',
        },
        uuid: {
            type: DataTypes.STRING,
            field: 'uuid',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        },
    }, {
        freezeTableName: true,
        tableName: 'internal_integration_api',
    });

    InternalIntegrationApi.getSecretKey = () => InternalIntegrationApi.findOne({where: {isActive: true}});

    return InternalIntegrationApi;
}