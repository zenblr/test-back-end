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
        interestRate:{
            type: DataTypes.FLOAT,
            field: 'interest_rate',
        },
        interestAmount: {
            type: DataTypes.DECIMAL(10,2),
            field: 'interest_amount',
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
        outstandingInterest:{
            type: DataTypes.DECIMAL(10,2),
            field: 'outstanding_interest',
            defaultValue: 0
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