module.exports = (sequelize, DataTypes) => {
    const CustomerLoanInitialInterest = sequelize.define('customerLoanInitialInterest', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false
        },
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
            allowNull: false
        },
        emiDueDate: {
            type: DataTypes.DATEONLY,
            field: 'emi_due_date'
        },
        interestAmount: {
            type: DataTypes.DECIMAL(10,2),
            field: 'interest_amount',
            defaultValue: 0
        },
        interestRate:{
            type: DataTypes.FLOAT,
            field: 'interest_rate',
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_loan_initial_interest',
    });

    CustomerLoanInitialInterest.associate = function (models) {

        CustomerLoanInitialInterest.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
        CustomerLoanInitialInterest.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });

        CustomerLoanInitialInterest.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
    }


    return CustomerLoanInitialInterest;
}