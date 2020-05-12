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
        commentByAppraiser: {
            type: DataTypes.TEXT,
            field: 'comment_by_appraiser'
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
        commentByBM: {
            type: DataTypes.TEXT,
            field: 'comment_by_bm'
        },
        totalEligibleAmt: {
            type: DataTypes.BIGINT,
            field: 'total_eligible_amt'
        },
        totalFinalInterestAmt: {
            type: DataTypes.BIGINT,
            field: 'total_final_interest_amt'
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
        customerLoan.hasOne(models.customerFinalLoan, { foreignKey: 'loanId', as: 'finalLoan' });

        customerLoan.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        customerLoan.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    // FUNCTION TO ADD CUSTOMER BANK DETAIL
    customerLoan.addCustomerLoan =
        (customerId, applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, totalEligibleAmt, totalFinalInterestAmt, createdBy, modifiedBy, t) => customerLoan.create({
            customerId, applicationFormForAppraiser, goldValuationForAppraiser, loanStatusForAppraiser, totalEligibleAmt, totalFinalInterestAmt, createdBy, modifiedBy, isActive: true
        }, { t });

    // FUNCTION TO GET APPROVAL FROM BM
    customerLoan.approvalFromBM =
        (id, applicationFormForBM, goldValuationForBM, loanStatusForBM, loanUniqueId, modifiedBy) => customerLoan.update({
            applicationFormForBM, goldValuationForBM, loanStatusForBM, loanUniqueId, modifiedBy
        }, { where: { id, isActive: true } });

    // FUNCTION TO GET LOAN DETAIL BY ID
    customerLoan.getLoanDetailById =
        (id) => customerLoan.findOne({ where: { id, isActive: true } });

    return customerLoan;
}