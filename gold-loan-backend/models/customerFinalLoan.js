module.exports = (sequelize, DataTypes) => {
    const CustomerFinalLoan = sequelize.define('customerFinalLoan', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        partnerId: {
            type: DataTypes.INTEGER,
            field: 'partner_id'
        },
        schemeId: {
            type: DataTypes.INTEGER,
            field: 'scheme_id'
        },
        finalLoanAmount: {
            type: DataTypes.BIGINT,
            field: 'final_loan_amount',
        },
        loanStartDate: {
            type: DataTypes.DATE,
            field: 'loan_start_date'
        },
        tenure: {
            type: DataTypes.INTEGER,
            field: 'tenure',
        },
        loanEndDate: {
            type: DataTypes.DATE,
            field: 'loan_end_date'
        },
        paymentFrequency: {
            type: DataTypes.STRING,
            field: 'payment_frequency'
        },
        processingCharge:{
            type: DataTypes.STRING,
            field: 'processing_charge'
        },
        interestRate: {
            type: DataTypes.STRING,
            field: 'interest_rate'
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
        tableName: 'customer_final_loan',
    });


    CustomerFinalLoan.associate = function (models) {
        CustomerFinalLoan.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
        CustomerFinalLoan.belongsTo(models.partner, { foreignKey: 'partnerId', as: 'partner' });
        CustomerFinalLoan.belongsTo(models.scheme, { foreignKey: 'schemeId', as: 'scheme' });

        CustomerFinalLoan.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerFinalLoan.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

    }

    // FUNCTION TO ADD FINAL LOAN CALCULATOR
    CustomerFinalLoan.addFinalLoanCalculator =
        (loanId, partnerName, schemeName, finalLoanAmount,
            loanStartDate, tenure, loanEndDate, paymentFrequency, interestRate, createdBy, modifiedBy, t) => CustomerFinalLoan.create({
                loanId, partnerName, schemeName, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentFrequency, interestRate,
                createdBy, modifiedBy, isActive: true
            }, { t });

    return CustomerFinalLoan;
}