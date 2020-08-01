module.exports = (sequelize, DataTypes) => {
    const CustomerLoanSlabRate = sequelize.define('customerLoanSlabRate', {
        //attribute
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id'
        },
        days: {
            type: DataTypes.INTEGER,
            field: 'days'
        },
        interestRate: {
            type: DataTypes.FLOAT,
            field: 'interest_rate'
        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'customer_loan_slab_rate',
        },
    )
    CustomerLoanSlabRate.associate = function (models) {

        CustomerLoanSlabRate.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' })

    }

    return CustomerLoanSlabRate;

}
