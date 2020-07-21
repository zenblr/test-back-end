module.exports = (sequelize, DataTypes) => {
    const CustomerLoanHistory = sequelize.define('customerLoanHistory', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false,
        },
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
            allowNull: false,
        },
        action: {
            type: DataTypes.STRING,
            field: 'action',
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
            allowNull: false
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'customer_loan_history',
    });


    CustomerLoanHistory.associate = function (models) {
        CustomerLoanHistory.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
        CustomerLoanHistory.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
        CustomerLoanHistory.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });

    }

    return CustomerLoanHistory;
}