module.exports = (sequelize, DataTypes) => {
    const KycCustomerBankDetail = sequelize.define('kycCustomerBankDetail', {
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
            field: 'account_type_id',
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
        tableName: 'customer_kyc_bank_detail',
    });


    KycCustomerBankDetail.associate = function(models) {

        KycCustomerBankDetail.belongsTo(models.kycCustomerPersonalDetail, { foreignKey: 'customerKycId', as: 'customerKyc' });

        KycCustomerBankDetail.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });

    }



    return KycCustomerBankDetail;
}