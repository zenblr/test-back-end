module.exports = (sequelize, DataTypes) => {
    const CustomerLoanTransferHistory = sequelize.define('customerLoanTransferHistory', {
        // attributes
        loanTransferId:{
            type: DataTypes.INTEGER,
            field: 'loan_transfer_id'
        },
        action: {
            type: DataTypes.TEXT,
            field: 'action'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
    }, {
        freezeTableName: true,
        tableName: 'customer_loan_transfer_history',
    });

    CustomerLoanTransferHistory.associate = function(models) {
        CustomerLoanTransferHistory.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerLoanTransferHistory.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
        CustomerLoanTransferHistory.belongsTo(models.customerLoanTransfer, { foreignKey: 'loanTransferId', as: 'loanTransfer' });

    }

    return CustomerLoanTransferHistory;
}