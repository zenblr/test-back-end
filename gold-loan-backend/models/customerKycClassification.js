module.exports = (sequelize, DataTypes) => {
    const CustomerKycClassification = sequelize.define('customerKycClassification', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
        },
        customerKycId: {
            type: DataTypes.INTEGER,
            field: 'customer_kyc_id',
        },
        kycRatingFromCce: {
            type: DataTypes.INTEGER,
            field: 'kyc_rating_from_cce',
        },
        kycStatusFromCce: {
            type: DataTypes.ENUM,
            field: 'kyc_status_from_cce',
            values: ['approved', 'pending', 'incomplete', 'rejected'],
        },
        reasonFromCce: {
            type: DataTypes.TEXT,
            field: 'reason_from_cce',
        },
        cceId: {
            type: DataTypes.INTEGER,
            field: 'cce_id',
        },
        kycStatusFromOperationalTeam: {
            type: DataTypes.ENUM,
            field: 'kyc_status_from_operational_team',
            values: ['approved', 'pending', 'incomplete', 'rejected'],
            defaultValue: "pending"
        },
        reasonFromOperationalTeam: {
            type: DataTypes.TEXT,
            field: 'reason_from_operational_team',
        },
        operationalTeamId: {
            type: DataTypes.INTEGER,
            field: 'operational_team_id',
        },
        scrapKycRatingFromCce: {
            type: DataTypes.INTEGER,
            field: 'scrap_kyc_rating_from_cce',
        },
        scrapKycStatusFromCce: {
            type: DataTypes.ENUM,
            field: 'scrap_kyc_status_from_cce',
            values: ['approved', 'pending', 'incomplete', 'rejected'],
        },
        scrapReasonFromCce: {
            type: DataTypes.TEXT,
            field: 'scrap_reason_from_cce',
        },
        scrapCceId: {
            type: DataTypes.INTEGER,
            field: 'scrap_cce_id',
        },
        scrapKycStatusFromOperationalTeam: {
            type: DataTypes.ENUM,
            field: 'scrap_kyc_status_from_operational_team',
            values: ['approved', 'pending', 'incomplete', 'rejected'],
            defaultValue: "pending"
        },
        scrapReasonFromOperationalTeam: {
            type: DataTypes.TEXT,
            field: 'scrap_reason_from_operational_team',
        },
        scrapOperationalTeamId: {
            type: DataTypes.INTEGER,
            field: 'scrap_operational_team_id',
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        createdByCustomer: {
            type: DataTypes.INTEGER,
            field: 'created_by_customer',
            allowNull: false,
        },
        modifiedByCustomer: {
            type: DataTypes.INTEGER,
            field: 'modified_by_customer',
            allowNull: false,
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
        CustomerKycClassification.belongsTo(models.user, { foreignKey: 'operationalTeamId', as: 'operationalTeamInfo' });

        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'kycRatingFromCce', as: 'KycRatingFromCce' });

        CustomerKycClassification.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerKycClassification.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return CustomerKycClassification;
}