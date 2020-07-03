module.exports = (sequelize, DataTypes) => {
    const CustomerLoanIntrestCalculator = sequelize.define('customerLoanIntrestCalculator', {
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
            type: DataTypes.FLOAT,
            field: 'secured_interest_amount',
        },
        emiReceivedDate: {
            type: DataTypes.DATEONLY,
            field: 'emi_due_date'
        },
        emiAmount: {
            type: DataTypes.STRING,
            field: 'emi_amount'
        },
        emiStatus: {
            type: DataTypes.ENUM,
            field: 'emi_status',
            values: ['pending', 'complete'],
            defaultValue: 'pending'
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
        tableName: 'customer_loan_intrest_calculator',
    });

    CustomerLoanIntrestCalculator.associate = function (models) {

        CustomerLoanIntrestCalculator.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
        CustomerLoanIntrestCalculator.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });

        CustomerLoanIntrestCalculator.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerLoanIntrestCalculator.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }


    return CustomerLoanIntrestCalculator;
}