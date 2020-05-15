module.exports = (sequelize, DataTypes) => {
    const disbursementOfLoan = sequelize.define('disbursementOfLoan', {
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
            defaultValue: false
        }
    }, {
        freezeTableName: true,
        tableName: 'disbursement_of_loan',
    });

    // FUNCTION TO DISBURSEMENT OF LOAN AMOUNT
    disbursementOfLoan.disbursementOfLoanAmount =
        (loanId, transactionId, date, createdBy, modifiedBy) => disbursementOfLoan.create({
            loanId, transactionId, date, createdBy, modifiedBy, isActive: true
        });

    return disbursementOfLoan;
}