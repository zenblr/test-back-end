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
        customerBehaviourRatingAppraisal: {
            type: DataTypes.INTEGER,
            field: 'customer_behaviour_rating_appraisal',
            allowNull: false
        },
        customerIdProofRatingAppraisal: {
            type: DataTypes.INTEGER,
            field: 'customer_id_proof_rating_appraisal',
            allowNull: false
        },
        customerAddressProofRatingAppraisal: {
            type: DataTypes.INTEGER,
            field: 'customer_address_proof_rating_appraisal',
            allowNull: false
        },
        customerKycStatusFromAppraisal: {
            type: DataTypes.ENUM,
            field: 'customer_kyc_status_from_appraisal',
            values: ['confirm', 'pending', 'closed'],
            allowNull: false
        },
        appraisalId: {
            type: DataTypes.INTEGER,
            field: 'appraisal_id',
            allowNull: false
        },

        customerBehaviourRatingBranchManager: {
            type: DataTypes.INTEGER,
            field: 'customer_behaviour_rating_branch_manager',
        },
        customerIdProofRatingBranchManager: {
            type: DataTypes.INTEGER,
            field: 'customer_id_proof_rating_branch_manager',
        },
        customerAddressProofRatingBranchManager: {
            type: DataTypes.INTEGER,
            field: 'customer_address_proof_rating_branch_manager',
        },
        customerKycStatusFromBranchManager: {
            type: DataTypes.ENUM,
            field: 'customer_kyc_status_from_branch_manager',
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

        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'customerBehaviourRatingAppraisal', as: 'behaviourRatingAppraisal' });        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'customerIdProofRatingAppraisal', as: 'idProofRatingAppraisal' });
        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'customerAddressProofRatingAppraisal', as: 'addressProofRatingAppraisal' });

        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'customerBehaviourRatingBranchManager', as: 'behaviourRatingBM' });
        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'customerIdProofRatingBranchManager', as: 'idProofRatingBM' });
        CustomerKycClassification.belongsTo(models.rating, { foreignKey: 'customerKycStatusFromBranchManager', as: 'addressProofRatingBM' });
    }

    return CustomerKycClassification;
}