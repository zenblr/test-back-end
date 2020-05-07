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
            values: ['confirm', 'pending', 'closed'],
            allowNull: false
        },
        cceId: {
            type: DataTypes.INTEGER,
            field: 'cce_id',
            allowNull: false
        },
        behaviourRatingBranchManager: {
            type: DataTypes.INTEGER,
            field: 'behaviour_rating_branch_manager',
        },
        idProofRatingBranchManager: {
            type: DataTypes.INTEGER,
            field: 'id_proof_rating_branch_manager',
        },
        addressProofRatingBranchManager: {
            type: DataTypes.INTEGER,
            field: 'address_proof_rating_branch_manager',
        },
        kycStatusFromBranchManager: {
            type: DataTypes.ENUM,
            field: 'kyc_status_from_branch_manager',
            values: ['confirm', 'pending', 'closed'],
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

        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'behaviourRatingBranchManager', as: 'behaviourBranchManager' });
        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'idProofRatingBranchManager', as: 'idProofBranchManager' });
        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'addressProofRatingBranchManager', as: 'addressProofBranchManager' });

  





    }

    return CustomerKycClassification;
}