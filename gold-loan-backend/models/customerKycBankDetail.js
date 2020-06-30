module.exports = (sequelize, DataTypes) => {
    const CustomerKycBankDetail = sequelize.define('customerKycBankDetail', {
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
        bankName:{
            type: DataTypes.STRING,
            field: 'bank_name'
        },
        bankBranchName:{
            type: DataTypes.STRING,
            field: 'bank_branch_name'
        },
        accountType:{
            type: DataTypes.ENUM,
            field: 'account_type',
            values: ['saving', 'current']
        },
        accountHolderName:{
            type: DataTypes.STRING,
            field: 'account_holder_name'
        },
        accountNumber:{
            type: DataTypes.STRING,
            field: 'account_number'
        },
        ifscCode:{
            type: DataTypes.STRING,
            field: 'ifsc_code'
        },
        passbookProof: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'passbook_proof'
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
        tableName: 'customer_kyc_bank_detail',
    });


    CustomerKycBankDetail.associate = function(models) {

        CustomerKycBankDetail.belongsTo(models.customerKyc, { foreignKey: 'customerKycId', as: 'customerKyc' });

        CustomerKycBankDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });

        CustomerKycBankDetail.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerKycBankDetail.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });     

    }



    return CustomerKycBankDetail;
}