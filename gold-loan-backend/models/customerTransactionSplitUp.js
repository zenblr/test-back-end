
module.exports = (sequelize, DataTypes) => {
    const CustomerTransactionSplitUp = sequelize.define('customerTransactionSplitUp', {
        //attribute
        customerLoanTransactionId: {
            type: DataTypes.INTEGER,
            field: 'customer_loan_transaction_id'
        },
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id'
        },
        payableOutstanding: {
            type: DataTypes.DECIMAL(10,2),
            field: 'payable_outstanding',
            defaultValue:0
        },
        penal:{
            type: DataTypes.DECIMAL(10,2),
            field: 'penal',
            defaultValue:0
        },
        interest:{
            type: DataTypes.DECIMAL(10,2),
            field: 'interest',
            defaultValue:0
        },
        otherAmount:{
            type: DataTypes.DECIMAL(10,2),
            field: 'other_amount',
            defaultValue:0
        },
        loanOutstanding:{
            type: DataTypes.DECIMAL(10,2),
            field: 'loan_outstanding',
            defaultValue:0
        },
        isSecured:{
            type: DataTypes.BOOLEAN,
            field: 'is_secured',
            defaultValue: true,
        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'customer_transaction_split_up',
        },
    )

    CustomerTransactionSplitUp.associate = function (models) {
        CustomerTransactionSplitUp.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
    }

    return CustomerTransactionSplitUp;

}