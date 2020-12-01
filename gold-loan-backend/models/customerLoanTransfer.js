const baseUrlConfig = require('../config/baseUrl');

module.exports = (sequelize, DataTypes) => {
    const CustomerLoanTransfer = sequelize.define('customerLoanTransfer', {
        transferredLoanId:{
            type: DataTypes.STRING,
            field: 'transferred_loan_id'
        },
        disbursedLoanAmount:{
            type: DataTypes.DECIMAL(10,2),
            field: 'disbursed_loan_amount'
        },
        transactionId:{
            type: DataTypes.STRING,
            field: 'transaction_id'
        },
        bankTransferType: {
            type: DataTypes.STRING,
            field:'bank_transfer_type'
        },
        loanTransferStatusForBM: {
            type: DataTypes.ENUM,
            field: 'loan_transfer_status_for_bm',
            values: ['approved', 'pending', 'incomplete', 'rejected'],
            defaultValue: 'pending'
        },
        loanTransferStatusForAppraiser:{
            type: DataTypes.ENUM,
            field: 'loan_transfer_status_for_appraiser',
            values: ['approved', 'pending', 'incomplete','rejected'],
            defaultValue: 'pending'
        },
        reasonByAppraiser:{
            type: DataTypes.TEXT,
            field: 'reason_by_appraiser'
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
            type: DataTypes.DECIMAL(10,2),
            field: 'outstanding_loan_amount'
        },
        processingCharge: {
            type: DataTypes.DECIMAL(10,2),
            defaultValue: 0,
            field: 'processing_charge'
        },
        loanTransferCurrentStage: {
            type: DataTypes.ENUM,
            field: 'loan_transfer_current_stage',
            values: ['1', '2', '3', '4','5','6']
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
        isLoanDisbursed:{
            type: DataTypes.BOOLEAN,
            field: 'is_loan_disbursed',
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
