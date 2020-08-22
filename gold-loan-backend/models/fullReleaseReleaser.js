const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const FullReleaseReleaser = sequelize.define('fullReleaseReleaser', {
        fullReleaseId: {
            type: DataTypes.INTEGER,
            field: 'full_release_id',
            allowNull: false
        },
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        releaserId: {
            type: DataTypes.INTEGER,
            field: 'releaser_id',
            allowNull: false
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            allowNull: false,
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
            allowNull: false,
        },
        appoinmentDate: {
            type: DataTypes.DATEONLY,
            field: 'appoinment_date',
        },
        startTime: {
            type: DataTypes.TIME,
            field: 'start_time',
        },
        endTime: {
            type: DataTypes.TIME,
            field: 'end_time',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        tableName: 'loan_full_release_releaser',
    });

    FullReleaseReleaser.associate = function (models) {
        FullReleaseReleaser.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        FullReleaseReleaser.belongsTo(models.user, { foreignKey: 'releaserId', as: 'appraiser' });
        FullReleaseReleaser.belongsTo(models.fullRelease, { foreignKey: 'fullReleaseId', as: 'fullRelease' });
        FullReleaseReleaser.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        FullReleaseReleaser.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return FullReleaseReleaser;
}