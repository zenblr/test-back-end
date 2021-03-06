module.exports = (sequelize, DataTypes) => {
    const CustomerLoanIntrest = sequelize.define('customerLoanInterest', {
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
        emiStartDate: {
            type: DataTypes.DATEONLY,
            field: 'emi_start_date'
        },
        emiEndDate: {
            type: DataTypes.DATEONLY,
            field: 'emi_end_date'
        },
        interestRate:{
            type: DataTypes.FLOAT,
            field: 'interest_rate',
        },
        rebateInterestRate: {
            type: DataTypes.FLOAT,
            field: 'rebate_interest_rate'
        },
        interestAmount: {
            type: DataTypes.DECIMAL(10,2),
            field: 'interest_amount',
            defaultValue: 0
        },
        highestInterestAmount: {
            type: DataTypes.DECIMAL(10,2),
            field: 'highest_interest_amount',
            defaultValue: 0
        },
        rebateAmount: {
            type: DataTypes.DECIMAL(10,2),
            field: 'rebate_amount',
            defaultValue: 0
        },
        paidAmount: {
            type: DataTypes.DECIMAL(10,2),
            field: 'paid_amount',
            defaultValue: 0
        },
        interestAccrual:{
            type: DataTypes.DECIMAL(10,2),
            field: 'interest_accrual',
            defaultValue: 0
        },
        totalInterestAccrual:{
            type: DataTypes.DECIMAL(10,2),
            field: 'total_interest_accrual',
            defaultValue: 0
        },
        outstandingInterest:{
            type: DataTypes.DECIMAL(10,2),
            field: 'outstanding_interest',
            defaultValue: 0
        },
        interestPaidFrom:{
            type:DataTypes.ENUM,
            field:'interest_paid_from',
            values: ['quickPay','partPayment'],
            defaultValue:'quickPay'
        },
        interestAmtPaidDuringQuickPay: {
            type: DataTypes.DECIMAL(10,2),
            field:'interest_amt_paid_during_quick_pay'
        },
        isPartPaymentEverReceived: {
            type: DataTypes.BOOLEAN,
            field: 'is_part_payment_ever_received',
            defaultValue: false
        },
        emiReceivedDate: {
            type: DataTypes.DATEONLY,
            field: 'emi_received_date'
        },
        penalInterest: {
            type: DataTypes.DECIMAL(10,2),
            field: 'penal_interest',
            defaultValue: 0
        },
        penalAccrual:{
            type: DataTypes.DECIMAL(10,2),
            field: 'penal_accrual',
            defaultValue: 0
        },
        penalOutstanding:{
            type: DataTypes.DECIMAL(10,2),
            field: 'penal_outstanding',
            defaultValue: 0
        },
        penalPaid:{
            type: DataTypes.DECIMAL(10,2),
            field: 'penal_paid',
            defaultValue: 0
        },
        emiStatus: {
            type: DataTypes.ENUM,
            field: 'emi_status',
            values: ['pending', 'paid','overdue','partially paid'],
            defaultValue: 'pending'
        },
        isExtraDaysInterest: {
            type: DataTypes.BOOLEAN,
            field: 'is_extra_days_interest',
            defaultValue: false
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
        tableName: 'customer_loan_interest',
    });

    CustomerLoanIntrest.associate = function (models) {

        CustomerLoanIntrest.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
        CustomerLoanIntrest.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });

        CustomerLoanIntrest.hasMany(models.customerTransactionDetail,{ foreignKey: 'loanInterestId', as: 'transaction' }  );

        CustomerLoanIntrest.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerLoanIntrest.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }


    return CustomerLoanIntrest;
}