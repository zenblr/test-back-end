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
        interestAmount: {
            type: DataTypes.FLOAT,
            field: 'interest_amount',
        },
        paidAmount: {
            type: DataTypes.FLOAT,
            field: 'paid_amount',
            defaultValue: 0
        },
        interestAccrual:{
            type: DataTypes.FLOAT,
            field: 'interest_accrual',
        },
        outstandingInterest:{
            type: DataTypes.FLOAT,
            field: 'outstanding_interest',
        },
        emiReceivedDate: {
            type: DataTypes.DATEONLY,
            field: 'emi_received_date'
        },
        panelInterest: {
            type: DataTypes.FLOAT,
            field: 'panel_interest',
            defaultValue: 0
        },
        PenalAccrual:{
            type: DataTypes.FLOAT,
            field: 'Penal_accrual',
        },
        penalOutstanding:{
            type: DataTypes.FLOAT,
            field: 'penal_outstanding',
        },
        penalPaid:{
            type: DataTypes.FLOAT,
            field: 'penal_paid',
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

        CustomerLoanIntrest.belongsToMany(models.customerLoanTransaction,  { through: models.customerInterestTransaction });

        CustomerLoanIntrest.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerLoanIntrest.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }


    return CustomerLoanIntrest;
}