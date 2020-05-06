module.exports = (sequelize, DataTypes) => {
    const CustomerKycClassification = sequelize.define('customerKycClassification', {
        // attributes
        customerKycId: {
            type: DataTypes.INTEGER,
            field: 'customer_kyc_id',
            allowNull: false
        },
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },

        behaviourRatingCce: {
            type: DataTypes.INTEGER,
            field: 'behaviour_rating_cce',
            allowNull: false
        },
        idProofRatingCce: {
            type: DataTypes.INTEGER,
            field: 'id_proof_rating_cce',
            allowNull: false
        },
        addressProofRatingCce: {
            type: DataTypes.INTEGER,
            field: 'address_proof_rating_cce',
            allowNull: false
        },
        kycStatusFromCce: {
            type: DataTypes.ENUM,
            field: 'kyc_status_from_cce',
            values: ['approved', 'pending', 'rejected'],
            allowNull: false
        },
        cceId: {
            type: DataTypes.INTEGER,
            field: 'cce_id',
            allowNull: false
        },
        behaviourRatingVerifiedByBm: {
            type: DataTypes.BOOLEAN,
            field: 'behaviour_rating_verified_by_bm',
            defaultValue: false
        },
        idProofRatingVerifiedByBm: {
            type: DataTypes.BOOLEAN,
            field: 'id_proof_rating_verified_by_bm',
            defaultValue: false
        },
        addressProofRatingVerifiedBm: {
            type: DataTypes.BOOLEAN,
            field: 'address_proof_rating_verified_by_bm',
            defaultValue: false
        },
        kycStatusFromBranchManager: {
            type: DataTypes.ENUM,
            field: 'kyc_status_from_branch_manager',
            values: ['approved', 'pending', 'rejected'],
        },
        branchManagerId: {
            type: DataTypes.INTEGER,
            field: 'branch_manager_id',
        },


    }, {
        freezeTableName: true,
        tableName: 'customer_kyc_classification',
    });


    CustomerKycClassification.associate = function (models) {

        CustomerKycClassification.belongsTo(models.customerKycPersonalDetail, { foreignKey: 'customerKycId', as: 'customerKyc' });
        CustomerKycClassification.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });

        CustomerKycClassification.belongsTo(models.user, { foreignKey: 'cceId', as: 'cceInfo' });
        CustomerKycClassification.belongsTo(models.user, { foreignKey: 'branchManagerId', as: 'branchManagerInfo' });

        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'behaviourRatingCce', as: 'behaviourCce' });
        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'idProofRatingCce', as: 'idProofCce' });
        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'addressProofRatingCce', as: 'addressProofCce' });

    }

    return CustomerKycClassification;
}