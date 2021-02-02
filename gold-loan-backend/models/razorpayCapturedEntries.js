module.exports = (sequelize, DataTypes) => {
    const razorpayCapturedEntries = sequelize.define('razorpayCapturedEntries', {
        walletTransactionTempDetailId: {
            type: DataTypes.INTEGER,
            field: 'wallet_transaction_temp_detail_id'
        },
        capturedTempDetails: {
            type: DataTypes.TEXT,
            field: 'captured_temp_details'
        },
        walletDetailId: {
            type: DataTypes.INTEGER,
            field: 'wallet_detail_id'
        }
    },
        {
            freezeTableName: true,
            tableName: 'razorpay_captured_entries',
        })
    return razorpayCapturedEntries;
}