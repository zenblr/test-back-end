module.exports = (sequelize, DataTypes) => {
    const customerLoanNomineeDetail = sequelize.define('customerLoanNomineeDetail', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        nomineeName: {
            type: DataTypes.STRING,
            field: 'nominee_name'
        },
        nomineeAge: {
            type: DataTypes.INTEGER,
            field: 'nominee_age'
        },
        relationship: {
            type: DataTypes.STRING,
            field: 'relationship'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: false
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_loan_nominee_detail',
    });


    customerLoanNomineeDetail.associate = function (models) {
        customerLoanNomineeDetail.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
    }

    // FUNCTION TO ADD CUSTOMER NOMINEE DETAIL
    customerLoanNomineeDetail.addCustomerNomineeDetail =
        (loanId, nomineeName, nomineeAge, relationship, t) => customerLoanNomineeDetail.create({
            loanId, nomineeName, nomineeAge, relationship, isActive: true
        }, { t });

    return customerLoanNomineeDetail;
}