module.exports = (sequelize, DataTypes) => {
    const CustomerInterestTransaction = sequelize.define('customerInterestTransaction', {
        //attribute
        loanInterestId:{
            type: DataTypes.INTEGER,
            field: 'loan_interest_id'
        },
        transactionId: {
            type: DataTypes.INTEGER,
            field: 'transaction_id'
        }
    },
        {
            freezeTableName: true,
            allowNull: false,   
            tableName: 'customerInterestTransaction',
        },
    )

    CustomerInterestTransaction.associate = function (models) {

    }

    return CustomerInterestTransaction;

}