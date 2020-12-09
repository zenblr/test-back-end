module.exports = (sequelize, DataTypes) => {
    const WalletTransactionDetails = sequelize.define('walletTransactionDetails', {
        //attribute
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        productTypeId: {
            type: DataTypes.INTEGER,
            field: 'product_type_id'
        },
        orderTypeId: {
            type: DataTypes.INTEGER,
            field: 'order_type_id',
        },
        // orderDetailId: {
        //     type: DataTypes.INTEGER,
        //     field: 'order_detail_id',
        // },
        walletId: {
            type: DataTypes.INTEGER,
            field: 'wallet_id',
        },
        transactionUniqueId: {
            type: DataTypes.STRING,
            field: 'transaction_unique_id'
        },
        bankTransactionUniqueId: {
            type: DataTypes.STRING,
            field: 'bank_transaction_unique_id'
        },
        razorpayOrderId:{
            type: DataTypes.STRING,
            field: 'razorpay_order_id'
        },
        razorpayPaymentId:{
            type: DataTypes.STRING,
            field: 'razorpay_payment_id'
        },
        razorpaySignature:{
            type: DataTypes.STRING,
            field: 'razorpay_signature'
        },
        paymentType: {
            type: DataTypes.STRING,
            field: 'payment_type',
        },
        transactionAmont: {
            type: DataTypes.DECIMAL(10, 2),
            field: 'transaction_amont'
        },
        paymentReceivedDate: {
            type: DataTypes.DATE,
            field: 'payment_received_date'
        },
        depositDate:{
            type: DataTypes.DATEONLY,
            field: 'deposit_date'
        },
        depositApprovedDate: {
            type: DataTypes.DATE,
            field: 'deposit_approved_date'
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
        depositStatus: {
            type: DataTypes.ENUM,
            field: 'deposit_status',
            values: ['Pending', 'Completed', 'Rejected'],
            defaultValue: 'Pending'
        },
        // paymentFor: {
        //     type: DataTypes.STRING,
        //     field: 'payment_for',
        // },
        runningBalance:{
            type: DataTypes.FLOAT,
            field: 'running_balance'
        },
        freeBalance:{
            type: DataTypes.FLOAT,
            field: 'free_balance'
        },
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'wallet_transaction_details',
        },
    )

    WalletTransactionDetails.associate = function (models) {
        // WalletTransactionDetails.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
       
    }

    return WalletTransactionDetails;

}