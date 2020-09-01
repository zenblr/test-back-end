
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
        transactionUniqueId: {
            type: DataTypes.STRING,
            field: 'transaction_unique_id'
        },
        bankTransactionUniqueId: {
            type: DataTypes.STRING,
            field: 'bank_transaction_unique_id'
        },
        paymentType:{
            type: DataTypes.STRING,
            field: 'payment_type',
        },
        transactionAmont: {
            type: DataTypes.DECIMAL(10,2),
            field: 'transaction_amont'
        },
        paymentReceivedDate: {
            type: DataTypes.DATE,
            field: 'payment_received_date'
        },
        depositDate:{
            type: DataTypes.DATE,
            field: 'deposit_date'
        },
        chequeNumber:{
            type: DataTypes.STRING,
            field: 'cheque_number',
        },
        bankName:{
            type: DataTypes.STRING,
            field: 'bank_name',
        },
        branchName:{
            type: DataTypes.STRING,
            field: 'branch_name',
        },
        depositStatus:{
            type: DataTypes.ENUM,
            field: 'deposit_status',
            values:['Pending','Completed','Rejected'],
            defaultValue: 'Pending'
        },
        paymentFor:{
            type: DataTypes.STRING,
            field: 'payment_for',
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
    }

    return CustomerLoanTransaction;

}