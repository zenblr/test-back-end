module.exports = (sequelize, DataTypes) => {
    const CustomerKyc = sequelize.define('customerKyc', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false,
        },
        isKycSubmitted: {
            type: DataTypes.BOOLEAN,
            field: 'is_kyc_submitted',
            defaultValue: false
        },
        isAppliedForKyc: {
            type: DataTypes.BOOLEAN,
            field: 'is_applied_for_kyc',
            defaultValue: false
        },
        isVerifiedByCce: {
            type: DataTypes.BOOLEAN,
            field: 'is_verified_by_Cce',
            defaultValue: false
        },
        cceVerifiedBy: {
            type: DataTypes.INTEGER,
            field: 'cce_verified_by',
            defaultValue: null
        },
        isVerifiedByBranchManager: {
            type: DataTypes.BOOLEAN,
            field: 'is_verified_by_branch_manager',
            defaultValue: false
        },
        branchManagerVerifiedBy: {
            type: DataTypes.INTEGER,
            field: 'branch_manager_verified_by',
            defaultValue: null
        },
        customerKycCurrentStage: {
            type: DataTypes.ENUM,
            field: 'customer_kyc_current_stage',
            values: ['1', '2', '3','4','5','6'],
            defaultValue: "2"
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            allowNull: false,
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
        tableName: 'customer_kyc',
    });

    CustomerKyc.associate = function(models) {
        CustomerKyc.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' })

        CustomerKyc.hasOne(models.customerKycPersonalDetail, { foreignKey: 'customerKycId', as: 'customerKycPersonal' });
        CustomerKyc.hasMany(models.customerKycAddressDetail, { foreignKey: 'customerKycId', as: 'customerKycAddress' });
        CustomerKyc.hasMany(models.customerKycBankDetail, { foreignKey: 'customerKycId', as: 'customerKycBank' });
        CustomerKyc.hasOne(models.customerKycClassification, { foreignKey: 'customerKycId', as: 'customerKycClassification' });

        CustomerKyc.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerKyc.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return CustomerKyc;

}