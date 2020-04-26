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

        behaviourRatingAppraisal: {
            type: DataTypes.INTEGER,
            field: 'behaviour_rating_appraisal',
            allowNull: false
        },
        idProofRatingAppraisal: {
            type: DataTypes.INTEGER,
            field: 'id_proof_rating_appraisal',
            allowNull: false
        },
        addressProofRatingAppraisal: {
            type: DataTypes.INTEGER,
            field: 'address_proof_rating_appraisal',
            allowNull: false
        },
        kycStatusFromAppraisal: {
            type: DataTypes.ENUM,
            field: 'kyc_status_from_appraisal',
            values: ['confirm', 'pending', 'closed'],
            allowNull: false
        },
        appraisalId: {
            type: DataTypes.INTEGER,
            field: 'appraisal_id',
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

        CustomerKycClassification.belongsTo(models.user, { foreignKey: 'appraisalId', as: 'appraisalInfo' });
        CustomerKycClassification.belongsTo(models.user, { foreignKey: 'branchManagerId', as: 'branchManagerInfo' });

        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'behaviourRatingAppraisal', as: 'behaviourAppraisal' });
        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'idProofRatingAppraisal', as: 'idProofAppraisal' });
        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'addressProofRatingAppraisal', as: 'addressProofAppraisal' });

        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'behaviourRatingBranchManager', as: 'behaviourBranchManager' });
        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'idProofRatingBranchManager', as: 'idProofBranchManager' });
        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'addressProofRatingBranchManager', as: 'addressProofBranchManager' });

  





    }

    return CustomerKycClassification;
}