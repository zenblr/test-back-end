module.exports = (sequelize, DataTypes) => {
    const CustomerKyc = sequelize.define('customerKyc', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false,
        },
        currentKycModuleId:{
            type: DataTypes.INTEGER,
            field: 'current_kyc_module_id',
        },
        isKycSubmitted: {
            type: DataTypes.BOOLEAN,
            field: 'is_kyc_submitted',
            defaultValue: false
        },
        isScrapKycSubmitted: {
            type: DataTypes.BOOLEAN,
            field: 'is_scrap_kyc_submitted',
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
        isVerifiedByOperationalTeam: {
            type: DataTypes.BOOLEAN,
            field: 'is_verified_by_operational_team',
            defaultValue: false
        },
        operationalTeamVerifiedBy: {
            type: DataTypes.INTEGER,
            field: 'operational_team_verified_by',
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
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        createdByCustomer: {
            type: DataTypes.INTEGER,
            field: 'created_by_customer',
        },
        modifiedByCustomer: {
            type: DataTypes.INTEGER,
            field: 'modified_by_customer',
        },
        isCityEdit : {
            type: DataTypes.BOOLEAN,
            field: 'is_city_edit',
            defaultValue: false
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
        CustomerKyc.hasOne(models.customerKycClassification, { foreignKey: 'customerKycId', as: 'customerKycClassification' });

        CustomerKyc.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerKyc.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        CustomerKyc.belongsTo(models.customer, { foreignKey: 'createdByCustomer', as: 'CreatedbyCustomer' });
        CustomerKyc.belongsTo(models.customer, { foreignKey: 'createdByCustomer', as: 'ModifiedbyCustomer' });
    }

    return CustomerKyc;

}