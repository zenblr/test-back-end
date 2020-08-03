module.exports = (sequelize, DataTypes) => {
    const CustomerDailyInterest = sequelize.define('customerDailyInterest', {
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
        interestDate:{
            type: DataTypes.DATEONLY,
            field: 'interest_date'
        },
        interestRate:{
            type: DataTypes.FLOAT,
            field: 'interest_rate',
        },
        interestAmount:{
            type: DataTypes.FLOAT,
            field: 'interest_amount',
        },
        interestStatus:{
            type: DataTypes.ENUM,
            field: 'interest_status',
            values: ['pending', 'paid'],
            defaultValue: 'pending'
        },
        penalInterestRate:{
            type: DataTypes.FLOAT,
            field: 'penal_interest_rate',
        },
        penalInterestAmount:{
            type: DataTypes.FLOAT,
            field: 'penal_interest_amount',
        },
        penalInterestStatus:{
            type: DataTypes.ENUM,
            field: 'penal_interest_status',
            values: ['pending', 'paid'],
            defaultValue: 'pending'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_daily_interest',
    });

    CustomerDailyInterest.associate = function (models) {
        CustomerDailyInterest.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
        CustomerDailyInterest.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });
    }


    return CustomerDailyInterest;
}