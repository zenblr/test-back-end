module.exports = (sequelize, DataTypes) => {
    const finalLoanCalculator = sequelize.define('finalLoanCalculator', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        partnerName: {
            type: DataTypes.STRING,
            field: 'partner_name'
        },
        schemeName: {
            type: DataTypes.STRING,
            field: 'scheme_name'
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
        paymentType: {
            type: DataTypes.STRING,
            field: 'payment_type'
        },
        interestRate: {
            type: DataTypes.STRING,
            field: 'interest_rate'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: false
        }
    }, {
        freezeTableName: true,
        tableName: 'final_loan_calculator',
    });


    finalLoanCalculator.associate = function (models) {
        finalLoanCalculator.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
    }

    // FUNCTION TO ADD FINAL LOAN CALCULATOR
    finalLoanCalculator.addFinalLoanCalculator =
        (loanId, partnerName, schemeName, finalLoanAmount,
            loanStartDate, tenure, loanEndDate, paymentType, interestRate, t) => finalLoanCalculator.create({
                loanId, partnerName, schemeName, finalLoanAmount, loanStartDate, tenure, loanEndDate, paymentType, interestRate,
                isActive: true
            }, { t });

    return finalLoanCalculator;
}