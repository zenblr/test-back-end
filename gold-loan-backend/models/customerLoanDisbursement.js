module.exports = (sequelize, DataTypes) => {
    const CustomerLoanDisbursement = sequelize.define('customerLoanDisbursement', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
            allowNull: false
        },
        disbursementAmount: {
            type: DataTypes.DECIMAL(10,2),
            field: 'disbursement_amount'
        },
        transactionId: {
            type: DataTypes.STRING,
            field: 'transaction_id'
        },
        date: {
            type: DataTypes.DATE,
            field: 'date'
        },
        paymentMode: {
            type: DataTypes.STRING,
            field: 'payment_mode'
        },
        ifscCode: {
            type: DataTypes.STRING,
            field:'ifsc_code'
        },
        bankName: {
            type: DataTypes.STRING,
            field:'bank_name'
        },
        bankBranch: {
            type: DataTypes.STRING,
            field:'bank_branch'
        },
        accountHolderName: {
            type: DataTypes.STRING,
            field:'account_holder_name'
        },
        accountNumber: {
            type: DataTypes.BIGINT,
            field:'account_number'
        },
        disbursementStatus: {
            type: DataTypes.STRING,
            field:'disbursement_status'
        },
        isLoanTransferExtraAmountAdded:{
            type: DataTypes.BOOLEAN,
            field: 'is_loan_transfer_extra_amount_added',
            defaultValue: false
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
        CustomerLoanDisbursement.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });


        CustomerLoanDisbursement.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerLoanDisbursement.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    // FUNCTION TO DISBURSEMENT OF LOAN AMOUNT
    CustomerLoanDisbursement.disbursementOfLoanAmount =
        (loanId, transactionId, date, createdBy, modifiedBy) => CustomerLoanDisbursement.create({
            loanId, transactionId, date, createdBy, modifiedBy, isActive: true
        });

    return CustomerLoanDisbursement;
}