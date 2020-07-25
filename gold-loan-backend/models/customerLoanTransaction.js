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
        transactionAmont: {
            type: DataTypes.FLOAT,
            field: 'transaction_amont'
        },
        paymentReceivedDate: {
            type: DataTypes.DATE,
            field: 'payment_received_date'
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

        CustomerLoanTransaction.belongsToMany(models.customerLoanInterest, { through: models.customerInterestTransaction });

    }

    return CustomerLoanTransaction;

}