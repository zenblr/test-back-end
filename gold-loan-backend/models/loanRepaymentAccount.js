module.exports = (sequelize, DataTypes) => {
    const loanRepaymentAccount = sequelize.define('loanRepaymentAccount', {
        // attributes
        accountNumber: {
            type: DataTypes.STRING,
            field: 'account_number'
        },
        ifscCode: {
            type: DataTypes.STRING,
            field: 'ifsc_code'
        },
        paymentMode: {
            type: DataTypes.STRING,
            field: 'payment_mode'
        },
        totalAmount: {
            type: DataTypes.BIGINT,
            field: 'total_amount'
        },
        repayAmount: {
            type: DataTypes.BIGINT,
            field: 'repay_amount'
        },
        totalPaid: {
            type: DataTypes.BIGINT,
            field: 'total_paid'
        },
        date: {
            type: DataTypes.DATE,
            field: 'date'
        },
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        loanUniqueId: {
            type: DataTypes.STRING,
            field: 'loan_unique_id'
        },
        loanAmount: {
            type: DataTypes.BIGINT,
            field: 'loan_amount'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: false
        }
    }, {
        freezeTableName: true,
        tableName: 'loan_repayment_account',
    });


    loanRepaymentAccount.associate = function (models) {
        loanRepaymentAccount.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
    }

    // FUNCTION TO ADD REPAYMENT FOR LOAN ACCOUNT
    loanRepaymentAccount.addLoanRepaymentForAccount =
        (accountNumber, ifscCode, loanId, loanUniqueId, loanAmount, paymentMode, date, repayAmount, totalPaid, totalAmount
        ) => loanRepaymentAccount.create({
            accountNumber, ifscCode, loanId, loanUniqueId, loanAmount, paymentMode, date, repayAmount, totalPaid, totalAmount, isActive: true
        });

    return loanRepaymentAccount;
}