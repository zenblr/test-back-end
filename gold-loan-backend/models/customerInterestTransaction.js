module.exports = (sequelize, DataTypes) => {
    const CustomerTransactionDetail = sequelize.define('customerTransactionDetail', {
        //attribute
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id'
        },
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id'
        },
        loanInterestId: {
            type: DataTypes.INTEGER,
            field: 'loan_interest_id'
        },
        referenceId: {
            type: DataTypes.STRING,
            field: 'reference_id'
        },
        customerLoanTransactionId: {
            type: DataTypes.INTEGER,
            field: 'customer_loan_transaction_id'
        },
        isPenalInterest: {
            type: DataTypes.BOOLEAN,
            field: 'is_penal_interest',
            defaultValue: false
        },
        otherChargesId: {
            type: DataTypes.INTEGER,
            field: 'other_charges_id'
        },
        credit: {
            type: DataTypes.DECIMAL(10, 2),
            field: 'credit',
            defaultValue: 0
        },
        debit: {
            type: DataTypes.DECIMAL(10, 2),
            field: 'debit',
            defaultValue: 0
        },
        paymentDate: {
            type: DataTypes.DATE,
            field: 'payment_date'
        },
        description: {
            type: DataTypes.STRING,
            field: 'description'
        },
        closingBalance:{
            type: DataTypes.DECIMAL(10, 2),
            field: 'closing_balance',
            defaultValue: 0
        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'customer_loan_transaction_detail',
        },
    )

    CustomerTransactionDetail.associate = function (models) {
        CustomerTransactionDetail.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });
        CustomerTransactionDetail.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
        CustomerTransactionDetail.belongsTo(models.customerLoanInterest, { foreignKey: 'loanInterestId', as: 'interest' });
        CustomerTransactionDetail.belongsTo(models.customerLoanOtherCharges, { foreignKey: 'otherChargesId', as: 'charges' });
        CustomerTransactionDetail.belongsTo(models.customerLoanTransaction, { foreignKey: 'customerLoanTransactionId', as: 'transaction' });
    }

    return CustomerTransactionDetail;

}