module.exports = (sequelize, DataTypes) => {
    const InterestPaymentAdjustment = sequelize.define('interestPaymentAdjustment', {
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
        transactionId: {
            type: DataTypes.INTEGER,
            field: 'transaction_id'
        },
        interestStartDate:{
            type: DataTypes.DATEONLY,
            field: 'interest_start_date'
        },
        interestEndDate:{
            type: DataTypes.DATEONLY,
            field: 'interest_end_date'
        },
        interestRate:{
            type: DataTypes.FLOAT,
            field: 'interest_rate',
        },
        paidInterest:{
            type: DataTypes.FLOAT,
            field: 'paid_interest',
        },
        penalStartDate:{
            type: DataTypes.FLOAT,
            field: 'penal_start_date',
        },
        penalEndDate:{
            type: DataTypes.FLOAT,
            field: 'penal_end_date',
        },
        slab:{
            type: DataTypes.FLOAT,
            field: 'slab',
        },
        advanceInterest:{
            type: DataTypes.FLOAT,
            field: 'advance_interest',
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
        tableName: 'interest_payment_adjustment',
    });

    InterestPaymentAdjustment.associate = function (models) {
        InterestPaymentAdjustment.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
        InterestPaymentAdjustment.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });
        InterestPaymentAdjustment.belongsTo(models.customerLoanTransaction, { foreignKey: 'transactionId', as: 'transaction'});
        InterestPaymentAdjustment.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        InterestPaymentAdjustment.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }


    return InterestPaymentAdjustment;
}