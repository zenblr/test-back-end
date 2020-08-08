module.exports = (sequelize, DataTypes) => {
    const leadNewRequest = sequelize.define('leadNewRequest', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        moduleId: {
            type: DataTypes.INTEGER,
            field: 'module_id',
            allowNull: false,
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        appraiserId: {
            type: DataTypes.INTEGER,
            field: 'appraiser_id',
        },
        isAssigned: {
            type: DataTypes.BOOLEAN,
            field: 'is_assigned',
            defaultValue: false
        }

    }, {
        freezeTableName: true,
        tableName: 'lead_new_request',
    });


    // LEAD NEW REQUEST ASSOCIATION WITH MODULES
    leadNewRequest.associate = function (models) {
        leadNewRequest.belongsTo(models.module, { foreignKey: 'moduleId', as: 'module' });
        leadNewRequest.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        leadNewRequest.belongsTo(models.user, { foreignKey: 'appraiserId', as: 'appraiser' });
    }
    return leadNewRequest;
}