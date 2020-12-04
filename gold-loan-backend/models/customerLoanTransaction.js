
module.exports = (sequelize, DataTypes) => {
    const CustomerLoanTransaction = sequelize.define('customerLoanTransaction', {
        //attribute
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id'
        },
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id'
        },
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        productTypeId: {
            type: DataTypes.INTEGER,
            field: 'product_type_id'
        },
        transactionUniqueId: {
            type: DataTypes.STRING,
            field: 'transaction_unique_id'
        },
        bankTransactionUniqueId: {
            type: DataTypes.STRING,
            field: 'bank_transaction_unique_id'
        },
        razorPayTransactionId: {
            type: DataTypes.STRING,
            field: 'razor_pay_transaction_id'
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
        paymentFor: {
            type: DataTypes.STRING,
            field: 'payment_for',
        },
        runningBalance:{
            type: DataTypes.FLOAT,
            field: 'running_balance'
        },
        freeBalance:{
            type: DataTypes.FLOAT,
            field: 'free_balance'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'customer_loan_transaction',
        },
    )

    CustomerLoanTransaction.associate = function (models) {
        CustomerLoanTransaction.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerLoanTransaction.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'modifieby' });

        CustomerLoanTransaction.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });
        CustomerLoanTransaction.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
        CustomerLoanTransaction.hasMany(models.customerTransactionDetail, { foreignKey: 'customerLoanTransactionId', as: 'transaction' });
        CustomerLoanTransaction.hasMany(models.customerTransactionSplitUp, { foreignKey: 'customerLoanTransactionId', as: 'transactionSplitUp' });
        CustomerLoanTransaction.belongsTo(models.module, { foreignKey: 'productTypeId', as: 'module' })
    }

    return CustomerLoanTransaction;

}