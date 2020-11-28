module.exports = (sequelize, DataTypes) => {
    const DigitalGoldCustomerKyc = sequelize.define('digiGoldCustomerKyc', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        accountNumber: {
            type: DataTypes.STRING,
            field: 'account_number'
        },
        bankId: {
            type: DataTypes.STRING,
            field: 'bank_id'
        },
        bankName: {
            type: DataTypes.STRING,
            field: 'bank_name'
        },
        ifscCode:{
            type:DataTypes.STRING,
            field:'ifsc_code',
        },
        userBankId:{
            type:DataTypes.STRING,
            field:'user_bank_id',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },

    },
        {
            freezeTableName: true,
            tableName: 'digi_gold_customer_kyc',
        }
    )

    DigitalGoldCustomerKyc.associate = (models) => {
        DigitalGoldCustomerKyc.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customerDetail' });
    }
    
    return DigitalGoldCustomerKyc;
}