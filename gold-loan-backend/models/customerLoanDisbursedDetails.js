module.exports = (sequelize, DataTypes) => {
    const CustomerLoanDisbursedDetails = sequelize.define('customerLoanDisbursedDetails', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
            allowNull: false,
        },
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
            allowNull: false,
        },
       customerLoanDisbursementId:{
        type: DataTypes.INTEGER,
        field: 'customer_loan_disbursement_id',
        allowNull: false,
       },
       disbursedAmount:{
        type: DataTypes.STRING,
        field: 'disbursed_amount',
       },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            allowNull: false
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'customer_loan_disbursed_details',
    });


    CustomerLoanDisbursedDetails.associate = function (models) {
        CustomerLoanDisbursedDetails.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
        CustomerLoanDisbursedDetails.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'loan' });
        CustomerLoanDisbursedDetails.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });

    }

    return CustomerLoanDisbursedDetails;
}