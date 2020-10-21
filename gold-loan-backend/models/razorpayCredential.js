module.exports = (sequelize, DataTypes) => {
    const RazorpayCredential = sequelize.define('loanRazorpayCredential', {
        keyId: {
            type: DataTypes.STRING,
            field: 'key_id'
        },
        keySecret: {
            type: DataTypes.STRING,
            field: 'key_secret'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    },
        {
            freezeTableName: true,
            tableName: 'loan_razorpay_credential',
        })
    return RazorpayCredential;
}
