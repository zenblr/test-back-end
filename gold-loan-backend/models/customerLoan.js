module.exports = (sequelize, DataTypes) => {
    const customerLoan = sequelize.define('customerLoan', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        loanUniqueId: {
            type: DataTypes.STRING,
            field: 'loan_unique_id'
        },
        applicationFormForAppraiser: {
            type: DataTypes.BOOLEAN,
            field: 'application_form_for_appraiser'
        },
        goldValuationForAppraiser: {
            type: DataTypes.BOOLEAN,
            field: 'gold_valuation_for_appraiser'
        },
        loanStatusForAppraiser: {
            type: DataTypes.STRING,
            field: 'loan_status_for_appraiser'
        },
        applicationFormForBM: {
            type: DataTypes.BOOLEAN,
            field: 'application_form_for_bm'
        },
        goldValuationForBM: {
            type: DataTypes.BOOLEAN,
            field: 'gold_valuation_for_bm'
        },
        loanStatusForBM: {
            type: DataTypes.STRING,
            field: 'loan_status_for_bm'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: false
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_loan',
    });

    // CUSTOMER LOAN ASSOCIATION WITH MODULES
    customerLoan.associate = function (models) {
        customerLoan.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        customerLoan.hasOne(models.customerLoanBankDetail, { foreignKey: 'loanId', as: 'loanBankDetail' });
        customerLoan.hasOne(models.customerLoanKycDetail, { foreignKey: 'loanId', as: 'loanKycDetail' });
        customerLoan.hasMany(models.customerLoanNomineeDetail, { foreignKey: 'loanId', as: 'loanNomineeDetail' });
        customerLoan.hasMany(models.customerLoanOrnamentsDetail, { foreignKey: 'loanId', as: 'loanOrnamentsDetail' });
        customerLoan.hasOne(models.customerLoanPersonalDetail, { foreignKey: 'loanId', as: 'loanPersonalDetail' });
        customerLoan.hasMany(models.packageImageUploadForLoan, { foreignKey: 'loanId', as: 'packetDetails' });
    }

    // FUNCTION TO ADD CUSTOMER BANK DETAIL
    customerLoan.addCustomerLoan =
        (customerId, applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, t) => customerLoan.create({
            customerId, applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, isActive: true
        }, { t });

    // FUNCTION TO GET APPROVAL FROM BM
    customerLoan.approvalFromBM =
        (id, applicationFormForBM, goldValuationForBM, loanStatusForBM, loanUniqueId) => customerLoan.update({
            applicationFormForBM, goldValuationForBM, loanStatusForBM, loanUniqueId
        }, { where: { id, isActive: true } });

    // FUNCTION TO GET LOAN DETAIL BY ID
    customerLoan.getLoanDetailById =
        (id) => customerLoan.findOne({ where: { id, isActive: true } });

    return customerLoan;
}