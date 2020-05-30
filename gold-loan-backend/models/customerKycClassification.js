module.exports = (sequelize, DataTypes) => {
    const CustomerKycClassification = sequelize.define('customerKycClassification', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        customerKycId: {
            type: DataTypes.INTEGER,
            field: 'customer_kyc_id',
            allowNull: false
        },
        kycRatingFromCce: {
            type: DataTypes.INTEGER,
            field: 'kyc_rating_from_cce',
            allowNull: false
        },
        kycStatusFromCce: {
            type: DataTypes.ENUM,
            field: 'kyc_status_from_cce',
            values: ['approved', 'pending', 'incomplete', 'rejected'],
            allowNull: false
        },
        reasonFromCce: {
            type: DataTypes.TEXT,
            field: 'reason_from_cce',
        },
        cceId: {
            type: DataTypes.INTEGER,
            field: 'cce_id',
            allowNull: false
        },
        kycStatusFromBm: {
            type: DataTypes.ENUM,
            field: 'kyc_status_from_bm',
            values: ['approved', 'pending', 'incomplete', 'rejected'],
            defaultValue: "pending"
        },
        reasonFromBm: {
            type: DataTypes.TEXT,
            field: 'reason_from_bm',
        },
        branchManagerId: {
            type: DataTypes.INTEGER,
            field: 'branch_manager_id',
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
        }

    }, {
        freezeTableName: true,
        tableName: 'customer_kyc_classification',
    });


    CustomerKycClassification.associate = function (models) {

        CustomerKycClassification.belongsTo(models.customerKyc, { foreignKey: 'customerKycId', as: 'customerKyc' });
        CustomerKycClassification.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });

        CustomerKycClassification.belongsTo(models.user, { foreignKey: 'cceId', as: 'cceInfo' });
        CustomerKycClassification.belongsTo(models.user, { foreignKey: 'branchManagerId', as: 'branchManagerInfo' });

        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'kycRatingFromCce', as: 'KycRatingFromCce' });

        CustomerKycClassification.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerKycClassification.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return CustomerKycClassification;
}