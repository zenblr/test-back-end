module.exports = (sequelize, DataTypes) => {
    const customerLoanBankDetail = sequelize.define('customerLoanBankDetail', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            field: 'name'
        },
        accountNumber: {
            type: DataTypes.STRING,
            field: 'account_number'
        },
        ifscCode: {
            type: DataTypes.STRING,
            field: 'ifsc_code'
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
        tableName: 'customer_loan_bank_detail',
    });


    customerLoanBankDetail.associate = function (models) {
        customerLoanBankDetail.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
    }

    // FUNCTION TO ADD CUSTOMER BANK DETAIL
    customerLoanBankDetail.addCustomerBankDetail =
        (loanId, name, accountNumber, ifscCode, createdBy, modifiedBy, t) => customerLoanBankDetail.create({
            loanId, name, accountNumber, ifscCode, createdBy, modifiedBy, isActive: true
        }, { t });

    return customerLoanBankDetail;
}