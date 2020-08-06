module.exports = (sequelize, DataTypes) => {
    const ScrapQuickPay = sequelize.define('scrapQuickPay', {
        // attributes
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id',
        },
        paymentMode: {
            type: DataTypes.ENUM,
            field: 'payment_mode',
            values: ['cash', 'bankTransfer', 'cheque'],
            allowNull: false
        },
        bankName: {
            type: DataTypes.STRING,
            field: 'bank_name'
        },
        bankBranch: {
            type: DataTypes.STRING,
            field: 'bank_branch'
        },
        transactionId: {
            type: DataTypes.STRING,
            field: 'transaction_id'
        },
        chequeNumber: {
            type: DataTypes.STRING,
            field: 'cheque_number'
        },
        depositAmount: {
            type: DataTypes.INTEGER,
            field: 'deposit_amount'
        },
        depositDate: {
            type: DataTypes.DATE,
            field: 'deposit_date'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        tableName: 'scrap_quick_pay',
    });

    return ScrapQuickPay;
}