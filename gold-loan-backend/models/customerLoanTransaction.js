
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
            type: DataTypes.INTEGER,
            field: 'transaction_unique_id'
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
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'customer_loan_transaction',
        },
    )

    CustomerLoanTransaction.associate = function (models) {
        CustomerLoanTransaction.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerLoanTransaction.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });
        CustomerLoanTransaction.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
        CustomerLoanTransaction.hasMany(models.customerInterestTransaction, { foreignKey: 'customerLoanTransactionId', as: 'transaction' });
    }

    return CustomerLoanTransaction;

}