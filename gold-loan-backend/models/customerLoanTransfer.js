const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const CustomerLoanTransfer = sequelize.define('customerLoanTransfer', {
        transferredLoanId:{
            type: DataTypes.STRING,
            field: 'transferred_loan_id'
        },
        disbursedLoanAmount:{
            type: DataTypes.INTEGER,
            field: 'disbursed_loan_amount'
        },
        transactionId:{
            type: DataTypes.STRING,
            field: 'transaction_id'
        },
        loanTransferStatusForBM: {
            type: DataTypes.ENUM,
            field: 'loan_transfer_status_for_bm',
            values: ['approved', 'pending', 'incomplete', 'rejected'],
            defaultValue: 'pending'
        },
        reasonByBM: {
            type: DataTypes.TEXT,
            field: 'reason_by_bm'
        },
        pawnTicket:{
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'pawn_ticket'
        },
        signedCheque:{
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'signed_cheque'
        },
        declaration:{
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'declaration'
        },
        outstandingLoanAmount:{
            type: DataTypes.INTEGER,
            field: 'outstanding_loan_amount'
        },
        loanTransferCurrentStage: {
            type: DataTypes.ENUM,
            field: 'loan_transfer_current_stage',
            values: ['1', '2', '3', '4','5']
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        isLoanApplied:{
            type: DataTypes.BOOLEAN,
            field: 'is_loan_applied',
            defaultValue: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_loan_transfer'
    })

    CustomerLoanTransfer.associate = function (models) {
        CustomerLoanTransfer.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerLoanTransfer.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return CustomerLoanTransfer;
}
