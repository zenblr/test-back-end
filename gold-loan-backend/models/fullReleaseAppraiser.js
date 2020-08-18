const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const FullReleaseAppraiser = sequelize.define('fullReleaseAppraiser', {
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
        appraiserId: {
            type: DataTypes.INTEGER,
            field: 'appraiser_id',
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
        tableName: 'loan_full_release_appraiser',
    });

    FullReleaseAppraiser.associate = function (models) {
        FullReleaseAppraiser.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        FullReleaseAppraiser.belongsTo(models.user, { foreignKey: 'appraiserId', as: 'appraiser' });
        FullReleaseAppraiser.belongsTo(models.fullRelease, { foreignKey: 'fullReleaseId', as: 'fullRelease' });
        FullReleaseAppraiser.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        FullReleaseAppraiser.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return FullReleaseAppraiser;
}