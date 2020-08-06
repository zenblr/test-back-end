module.exports = (sequelize, DataTypes) => {
    const LoanOtherChargesMaster = sequelize.define('loanOtherChargesMaster', {
        //attribute
    
        description:{
            type: DataTypes.STRING,
            field: 'description'
        },
    },
        {
            freezeTableName: true,
            allowNull: false,   
            tableName: 'loan_other_charges_master',
        },
    )

    LoanOtherChargesMaster.associate = function (models) {
        LoanOtherChargesMaster.hasMany(models.customerLoanOtherCharges, { foreignKey: 'otherChargesId', as: 'loanCharges' });
    }

    return LoanOtherChargesMaster;

}