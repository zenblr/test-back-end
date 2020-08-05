module.exports = (sequelize, DataTypes) => {
    const CustomerInterestTransaction = sequelize.define('customerInterestTransaction', {
        //attribute
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id'
        },
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id'
        },
        loanInterestId:{
            type: DataTypes.INTEGER,
            field: 'loan_interest_id'
        },
        customerLoanTransactionId: {
            type: DataTypes.INTEGER,
            field: 'customer_loan_transaction_id'
        },
        isPenalInterest:{
            type: DataTypes.FLOAT,
            field: 'is_penal_interest'
        },
        otherChargesId:{
            type: DataTypes.INTEGER,
            field: 'other_charges_id'
        },
        credit:{
            type: DataTypes.FLOAT,
            field: 'credit'
        },
        debit:{
            type: DataTypes.FLOAT,
            field: 'credit'
        },
        paymentDate:{
            type: DataTypes.DATE,
            field: 'payment_date'
        },
        description:{
            type: DataTypes.STRING,
            field: 'description'
        }
    },
        {
            freezeTableName: true,
            allowNull: false,   
            tableName: 'customer_interest_transaction',
        },
    )

    CustomerInterestTransaction.associate = function (models) {
        CustomerInterestTransaction.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });
        CustomerInterestTransaction.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
        CustomerInterestTransaction.belongsTo(models.customerLoanInterest, { foreignKey: 'loanInterestId', as: 'interest' });
        CustomerInterestTransaction.belongsTo(models.customerLoanOtherCharges, { foreignKey: 'otherChargesId', as: 'charges' });
        CustomerInterestTransaction.belongsTo(models.customerLoanTransaction, { foreignKey: 'customerLoanTransactionId', as: 'transaction' });
    }

    return CustomerInterestTransaction;

}