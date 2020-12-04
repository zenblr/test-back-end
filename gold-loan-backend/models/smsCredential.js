module.exports = (sequelize, DataTypes) => {
    const smsCredential = sequelize.define('loanSmsCredential', {
        key: {
            type: DataTypes.STRING,
            field: 'key'
        },
        url: {
            type: DataTypes.STRING,
            field: 'url'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    },
        {
            freezeTableName: true,
            tableName: 'loan_sms_credential',
        })
    return smsCredential;
}
