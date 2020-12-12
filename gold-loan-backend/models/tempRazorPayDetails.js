module.exports = (sequelize, DataTypes) => {
    const tempRazorPayDetails = sequelize.define('tempRazorPayDetails', {
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
        },
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
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
        chequeNumber: {
            type: DataTypes.STRING,
            field: 'cheque_number',
        },
        bankName: {
            type: DataTypes.STRING,
            field: 'bank_name',
        },
        branchName: {
            type: DataTypes.STRING,
            field: 'branch_name',
        },
        ornamentId: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'ornament_id',
        },
        transactionUniqueId:{
            type: DataTypes.STRING,
            field: 'transaction_unique_id'
        },
        isOrderPlaced: {
            type: DataTypes.BOOLEAN,
            field: 'is_order_placed',
            defaultValue: false,
        },
        refundCronExecuted: {
            type: DataTypes.BOOLEAN,
            field: 'refund_cron_executed',
            defaultValue: false,
        }
    }, {
        freezeTableName: true,
        tableName: 'razor_temp_details',
    })

    tempRazorPayDetails.getTempOrderDetail = (razorPayOrderId) => tempRazorPayDetails.findOne({where:{razorPayOrderId}})

    return tempRazorPayDetails;
}