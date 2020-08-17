module.exports = (sequelize, DataTypes) => {
    const CustomerLoanOtherCharges = sequelize.define('customerLoanOtherCharges', {
        //attribute
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id'
        },
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id'
        },
        otherChargesId: {
            type: DataTypes.INTEGER,
            field: 'other_charges_id'
        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'loan_other_charges_master',
        },
    )

    CustomerLoanOtherCharges.associate = function (models) {
        CustomerLoanOtherCharges.hasMany(models.customerTransactionDetail, { foreignKey: 'otherChargesId', as: 'charges' });
    }

    return CustomerLoanOtherCharges;

}