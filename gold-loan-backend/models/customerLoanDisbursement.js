module.exports = (sequelize, DataTypes) => {
    const CustomerLoanDisbursement = sequelize.define('customerLoanDisbursement', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        transactionId: {
            type: DataTypes.STRING,
            field: 'transaction_id'
        },
        date: {
            type: DataTypes.DATE,
            field: 'date'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_loan_disbursement',
    });

    CustomerLoanDisbursement.associate = function (models) {
        CustomerLoanDisbursement.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
    }

    // FUNCTION TO DISBURSEMENT OF LOAN AMOUNT
    CustomerLoanDisbursement.disbursementOfLoanAmount =
        (loanId, transactionId, date, createdBy, modifiedBy) => CustomerLoanDisbursement.create({
            loanId, transactionId, date, createdBy, modifiedBy, isActive: true
        });

    return CustomerLoanDisbursement;
}