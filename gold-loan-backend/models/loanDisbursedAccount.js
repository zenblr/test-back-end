module.exports = (sequelize, DataTypes) => {
    const loanDisbursedAccount = sequelize.define('loanDisbursedAccount', {
        // attributes
        partnerId: {
            type: DataTypes.INTEGER,
            field: 'partner_id',
            allowNull: false
        },
        partnerUniqueId: {
            type: DataTypes.STRING,
            field: 'partner_unique_id'
        },
        partnerName: {
            type: DataTypes.STRING,
            field: 'partner_name'
        },
        branchId: {
            type: DataTypes.INTEGER,
            field: 'branch_id',
            allowNull: false
        },
        branchUniqueId: {
            type: DataTypes.STRING,
            field: 'branch_unique_id'
        },
        accountNumber: {
            type: DataTypes.STRING,
            field: 'account_number'
        },
        ifscCode: {
            type: DataTypes.STRING,
            field: 'ifsc_code'
        },
        transactionId: {
            type: DataTypes.STRING,
            field: 'transaction_id'
        },
        totalBalance: {
            type: DataTypes.BIGINT,
            field: 'total_balance'
        },
        reduceAmount: {
            type: DataTypes.BIGINT,
            field: 'reduce_amount'
        },
        remainingAmount: {
            type: DataTypes.BIGINT,
            field: 'remaining_amount'
        },
        removeDate: {
            type: DataTypes.DATE,
            field: 'remove_date'
        },
        removeBy: {
            type: DataTypes.STRING,
            field: 'remove_by'
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
        tableName: 'loan_disbursed_account',
    });


    loanDisbursedAccount.associate = function (models) {
        loanDisbursedAccount.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
    }

    // FUNCTION TO ADD DISBURSEMENT FOR LOAN ACCOUNT
    loanDisbursedAccount.addLoanDisbusedForAccount =
        (partnerId, partnerUniqueId, partnerName, branchId, branchUniqueId, accountNumber, ifscCode, transactionId, totalBalance,
            reduceAmount, remainingAmount, removeDate, removeBy, loanId, loanUniqueId, loanAmount) => loanDisbursedAccount.create({
                partnerId, partnerUniqueId, partnerName, branchId, branchUniqueId, accountNumber, ifscCode, transactionId, totalBalance,
                reduceAmount, remainingAmount, removeDate, removeBy, loanId, loanUniqueId, loanAmount, isActive: true
            });

    return loanDisbursedAccount;
}