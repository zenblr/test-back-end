const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const PartReleaseAppraiser = sequelize.define('partReleaseAppraiser', {
        partReleaseId: {
            type: DataTypes.INTEGER,
            field: 'part_release_id',
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
        tableName: 'loan_part_release_appraiser',
    });

    PartReleaseAppraiser.associate = function (models) {
        PartReleaseAppraiser.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        PartReleaseAppraiser.belongsTo(models.user, { foreignKey: 'appraiserId', as: 'appraiser' });
        PartReleaseAppraiser.belongsTo(models.partRelease, { foreignKey: 'partReleaseId', as: 'partRelease' });
        PartReleaseAppraiser.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        PartReleaseAppraiser.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return PartReleaseAppraiser;
}