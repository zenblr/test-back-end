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
        masterLoan: {
            type: DataTypes.STRING,
            field: 'master_loan'
        },
        applicationFormForAppraiser: {
            type: DataTypes.BOOLEAN,
            field: 'application_form_for_appraiser',
            defaultValue: false
        },
        goldValuationForAppraiser: {
            type: DataTypes.BOOLEAN,
            field: 'gold_valuation_for_appraiser',
            defaultValue: false
        },
        loanStatusForAppraiser: {
            type: DataTypes.ENUM,
            field: 'loan_status_for_appraiser',
            values: ['approved', 'pending', 'rejected'],
        },
        commentByAppraiser: {
            type: DataTypes.TEXT,
            field: 'comment_by_appraiser'
        },
        appraiserId: {
            type: DataTypes.INTEGER,
            field: 'appraiser_id'
        },
        applicationFormForBM: {
            type: DataTypes.BOOLEAN,
            field: 'application_form_for_bm',
            defaultValue: false
        },
        goldValuationForBM: {
            type: DataTypes.BOOLEAN,
            field: 'gold_valuation_for_bm',
            defaultValue: false
        },
        loanStatusForBM: {
            type: DataTypes.ENUM,
            field: 'loan_status_for_bm',
            values: ['approved', 'pending', 'incomplete', 'rejected'],
            defaultValue: 'pending'
        },
        commentByBM: {
            type: DataTypes.TEXT,
            field: 'comment_by_bm'
        },
        bmId: {
            type: DataTypes.INTEGER,
            field: 'bm_id'
        },
        partnerId: {
            type: DataTypes.INTEGER,
            field: 'partner_id'
        },
        schemeId: {
            type: DataTypes.INTEGER,
            field: 'scheme_id'
        },
        unsecuredSchemeId: {
            type: DataTypes.INTEGER,
            field: 'unsecured_scheme_id'
        },
        totalEligibleAmt: {
            type: DataTypes.STRING,
            field: 'total_eligible_amt'
        },
        totalFinalInterestAmt: {
            type: DataTypes.STRING,
            field: 'total_final_interest_amt'
        },
        finalLoanAmount: {
            type: DataTypes.STRING,
            field: 'final_loan_amount',
        },
        securedLoanAmount: {
            type: DataTypes.STRING,
            field: 'secured_loan_amount',
        },
        unsecuredLoanAmount: {
            type: DataTypes.STRING,
            field: 'unsecured_loan_amount',
        },
        tenure: {
            type: DataTypes.INTEGER,
            field: 'tenure',
        },
        loanStartDate: {
            type: DataTypes.DATEONLY,
            field: 'loan_start_date'
        },
        loanEndDate: {
            type: DataTypes.DATEONLY,
            field: 'loan_end_date'
        },
        paymentFrequency: {
            type: DataTypes.STRING,
            field: 'payment_frequency'
        },
        processingCharge: {
            type: DataTypes.STRING,
            field: 'processing_charge'
        },
        interestRate: {
            type: DataTypes.STRING,
            field: 'interest_rate'
        },
        unsecuredInterestRate: {
            type: DataTypes.STRING,
            field: 'unsecured_interest_rate'
        },
        loanType: {
            type: DataTypes.STRING,
            field: 'loan_type'
        },
        unsecuredLoanId:{
            type: DataTypes.STRING,
            field: 'unsecured_loan_id'
        },
        customerLoanCurrentStage: {
            type: DataTypes.ENUM,
            field: 'customer_loan_current_stage',
            values: ['1', '2', '3', '4', '5', '6']
        },
        loanStageId: {
            type: DataTypes.INTEGER,
            field: 'loan_stage_id'
        },
        isLoanSubmitted: {
            type: DataTypes.BOOLEAN,
            field: 'is_loan_submitted',
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
        customerLoan.hasOne(models.customerFinalLoan, { foreignKey: 'loanId', as: 'finalLoan' });
        customerLoan.hasMany(models.customerLoanPackageDetails, { foreignKey: 'loanId', as: 'loanPacketDetails' });
        customerLoan.hasMany(models.packet, { foreignKey: 'loanId', as: 'packet' });

        customerLoan.belongsTo(models.loanStage, { foreignKey: 'loanStageId', as: 'loanStage' });

        CustomerFinalLoan.belongsTo(models.partner, { foreignKey: 'partnerId', as: 'partner' });
        CustomerFinalLoan.belongsTo(models.scheme, { foreignKey: 'schemeId', as: 'scheme' });
        CustomerFinalLoan.belongsTo(models.scheme, { foreignKey: 'unsecuredSchemeId', as: 'unsecuredScheme' });

        customerLoan.belongsTo(models.user, { foreignKey: 'appraiserId', as: 'appraiser' });
        customerLoan.belongsTo(models.user, { foreignKey: 'bmId', as: 'bm' });

        customerLoan.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        customerLoan.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

        customerLoan.hasMany(models.customerLoanIntrestCalculator, { foreignKey: 'loanId', as: 'customerLoanIntrestCalculator' });

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