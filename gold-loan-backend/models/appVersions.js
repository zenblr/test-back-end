module.exports = (sequelize, DataTypes) => {
    const appVersions = sequelize.define('appVersions', {
        version: {
            type: DataTypes.STRING,
            field: 'version'
        },
        isForceUpdate: {
            type: DataTypes.BOOLEAN,
            field: 'is_force_update',
            defaultValue: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        },
        createdAt: {
            type: DataTypes.DATE,
        },
        isBeta: {
            type: DataTypes.BOOLEAN,
            field: 'is_beta',
        }

    }, {
        freezeTableName: true,
        tableName: 'app_versions',
        timestamps: false
    });

    return appVersions;
}