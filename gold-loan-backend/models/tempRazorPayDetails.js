module.exports = (sequelize, DataTypes) => {
    const tempRazorPayDetails = sequelize.define('tempRazorPayDetails', {
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
        },
        razorPayOrderId: {
            type: DataTypes.STRING,
            field: 'razor_pay_order_id',
            defaultValue: null
        },
        amount: {
            type: DataTypes.STRING,
            field: 'amount',
            defaultValue: null
        },
        paymentFor: {
            type: DataTypes.STRING,
            field: 'payment_for',
            values: ['quickPay', 'partPayment', 'jewelleryRelease']
        },
        depositDate: {
            type: DataTypes.DATEONLY,
            field: 'deposit_date',
            defaultValue: null
        },
        paymentType: {
            type: DataTypes.STRING,
            field: 'payment_type',
        },
        ornamentId: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'ornament_id',
        },
        transactionUniqueId: {
            type: DataTypes.STRING,
            field: 'transaction_unique_id'
        },
        orderStatus: {
            type: DataTypes.STRING,
            field: 'order_status',
            defaultValue: "pending",
        }
    }, {
        freezeTableName: true,
        tableName: 'razor_temp_details',
    })

    return tempRazorPayDetails;
}