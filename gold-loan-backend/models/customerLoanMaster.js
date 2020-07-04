const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const CustomerLoanMaster = sequelize.define('customerLoanMaster', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        masterLoanUniqueId: {
            type: DataTypes.STRING,
            field: 'master_loan_unique_id'
        },
        parentLoanId: {
            type: DataTypes.INTEGER,
            field: 'parent_loan_id',
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
        applicationFormForOperatinalTeam: {
            type: DataTypes.BOOLEAN,
            field: 'application_form_for_operatinal_team',
            defaultValue: false
        },
        goldValuationForOperatinalTeam: {
            type: DataTypes.BOOLEAN,
            field: 'gold_valuation_for_operatinal_team',
            defaultValue: false
        },
        loanStatusForOperatinalTeam: {
            type: DataTypes.ENUM,
            field: 'loan_status_for_operatinal_team',
            values: ['approved', 'pending', 'incomplete', 'rejected'],
            defaultValue: 'pending'
        },
        commentByOperatinalTeam: {
            type: DataTypes.TEXT,
            field: 'comment_by_operatinal_team'
        },
        operatinalTeamId: {
            type: DataTypes.INTEGER,
            field: 'operatinal_team_id'
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
        tableName: 'customer_loan_master'
    })


    CustomerLoanMaster.associate = function (models) {
        CustomerLoanMaster.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });

        CustomerLoanMaster.hasMany(models.customerLoan, { foreignKey: 'masterLoanId', as: 'customerLoan' });
        CustomerLoanMaster.hasOne(models.customerLoanBankDetail, { foreignKey: 'masterLoanId', as: 'loanBankDetail' });
        CustomerLoanMaster.hasMany(models.customerLoanNomineeDetail, { foreignKey: 'masterLoanId', as: 'loanNomineeDetail' });
        CustomerLoanMaster.hasMany(models.customerLoanOrnamentsDetail, { foreignKey: 'masterLoanId', as: 'loanOrnamentsDetail' });
        CustomerLoanMaster.hasOne(models.customerLoanPersonalDetail, { foreignKey: 'masterLoanId', as: 'loanPersonalDetail' });
        CustomerLoanMaster.hasMany(models.customerLoanPackageDetails, { foreignKey: 'masterLoanId', as: 'loanPacketDetails' });
        CustomerLoanMaster.hasMany(models.packet, { foreignKey: 'masterLoanId', as: 'packet' });
        CustomerLoanMaster.hasMany(models.customerLoanInterest, { foreignKey: 'masterLoanId', as: 'customerLoanInterest' });
        CustomerLoanMaster.hasMany(models.customerLoanDisbursement, { foreignKey: 'masterLoanId', as: 'customerLoanDisbursement' });
        CustomerLoanMaster.hasOne(models.customerLoanDocument, { foreignKey: 'masterLoanId', as: 'customerLoanDocument' });

        CustomerLoanMaster.belongsTo(models.loanStage, { foreignKey: 'loanStageId', as: 'loanStage' });

        CustomerLoanMaster.belongsTo(models.user, { foreignKey: 'appraiserId', as: 'appraiser' });
        CustomerLoanMaster.belongsTo(models.user, { foreignKey: 'bmId', as: 'bm' });
        CustomerLoanMaster.belongsTo(models.user, { foreignKey: 'operatinalTeamId', as: 'operatinalTeam' });

        CustomerLoanMaster.belongsTo(models.customerLoanMaster, { foreignKey: 'parentLoanId', as: 'parentLoan' });

        CustomerLoanMaster.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerLoanMaster.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

    }

    return CustomerLoanMaster;
}
