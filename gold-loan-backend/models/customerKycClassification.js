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
            type: DataTypes.ENUM,
            field: 'customer_behaviour_rating_appraisal',
            values: ['1', '2', '3', '4', '5'],
            allowNull: false
        },
        customerIdProofRatingAppraisal: {
            type: DataTypes.ENUM,
            field: 'customer_id_proof_rating_appraisal',
            values: ['1', '2', '3', '4', '5'],
            allowNull: false
        },
        customerAddressProofRatingAppraisal: {
            type: DataTypes.ENUM,
            field: 'customer_address_proof_rating_appraisal',
            values: ['1', '2', '3', '4', '5'],
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
            type: DataTypes.ENUM,
            field: 'customer_behaviour_rating_branch_manager',
            values: ['1', '2', '3', '4', '5'],
        },
        customerIdProofRatingBranchManager: {
            type: DataTypes.ENUM,
            field: 'customer_id_proof_rating_branch_manager',
            values: ['1', '2', '3', '4', '5'],
        },
        customerAddressProofRatingBranchManager: {
            type: DataTypes.ENUM,
            field: 'customer_address_proof_rating_branch_manager',
            values: ['1', '2', '3', '4', '5'],
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
       
    }

    return CustomerKycClassification;
}