module.exports = (sequelize, DataTypes) => {
    const KycCustomerBankDetail = sequelize.define('kycCustomerBankDetail', {
        // attributes
        kycCustomerId: {
            type: DataTypes.INTEGER,
            field: 'kyc_customer_id',
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
        accountTypeId:{
            type: DataTypes.INTEGER,
            field: 'account_type_id',
        },
        accountHolderName:{
            type: DataTypes.STRING,
            field: 'account_holder_name'
        },
        accountNumber:{
            type: DataTypes.STRING,
            field: 'account_number'
        },
        ifcCode:{
            type: DataTypes.STRING,
            field: 'ifc_code'
        },
        passbookProof: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'passbook_proof'
        }
   
    }, {
        freezeTableName: true,
        tableName: 'kyc_customer_bank_detail',
    });


    KycCustomerBankDetail.associate = function(models) {

        KycCustomerBankDetail.belongsTo(models.kycCustomerPersonalDetail, { foreignKey: 'kycCustomerId', as: 'kycCustomer' });

        KycCustomerBankDetail.belongsTo(models.accountType, { foreignKey: 'accountTypeId', as: 'accountType' });
    }



    return KycCustomerBankDetail;
}