module.exports = (sequelize, DataTypes) => {
    const AppraiserRequest = sequelize.define('appraiserRequest', {
        //leadNewRequest
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        productId: {
            type: DataTypes.INTEGER,
            field: 'product_id',
        },
        moduleId: {
            type: DataTypes.INTEGER,
            field: 'module_id',
        },
        appraiserId: {
            type: DataTypes.INTEGER,
            field: 'appraiser_id',
        },
        status: {
            type: DataTypes.ENUM,
            field: 'status',
            values: ['incomplete', 'complete'],
            defaultValue: 'incomplete'
        },
        isAssigned: {
            type: DataTypes.BOOLEAN,
            field: 'is_assigned',
            defaultValue: false
        },
        isProcessComplete: {
            type: DataTypes.BOOLEAN,
            field: 'is_process_complete',
            defaultValue: false
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
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        },

    }, {
        freezeTableName: true,
        tableName: 'appraiser_request',
    });


    // LEAD NEW REQUEST ASSOCIATION WITH MODULES
    AppraiserRequest.associate = function (models) {
        AppraiserRequest.belongsTo(models.product, { foreignKey: 'productId', as: 'product' });

        AppraiserRequest.belongsTo(models.module, { foreignKey: 'moduleId', as: 'module' });
        AppraiserRequest.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        AppraiserRequest.belongsTo(models.user, { foreignKey: 'appraiserId', as: 'appraiser' });
        AppraiserRequest.hasOne(models.customerLoanMaster, { foreignKey: 'requestId', as: 'masterLoan' });

    }
    return AppraiserRequest;
}