module.exports = (sequelize, DataTypes) => {
    const PartRelease = sequelize.define('partRelease', {
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
            allowNull: false
        },
        payableAmount:{
            type: DataTypes.FLOAT,
            field: 'payable_amount',
        },
        paymentType:{
            type: DataTypes.STRING,
            field: 'payment_Type',
        },
        transactionId:{
            type: DataTypes.STRING,
            field: 'transaction_id',
        },
        paidAmount:{
            type: DataTypes.FLOAT,
            field: 'paid_amount',
        },
        releaseAmount:{
            type: DataTypes.FLOAT,
            field: 'release_amount',
        },
        interestAmount:{
            type: DataTypes.FLOAT,
            field: 'interest_amount',
        },
        penalInterest:{
            type: DataTypes.FLOAT,
            field: 'penal_interest',
        },
        depositDate:{
            type: DataTypes.DATE,
            field: 'deposit_date',
        },
        chequeNumber:{
            type: DataTypes.STRING,
            field: 'cheque_number',
        },
        bankName:{
            type: DataTypes.STRING,
            field: 'bank_name',
        },
        amountStatus:{
            type: DataTypes.ENUM,
            field: 'amount_status',
            values: ['pending', 'completed', 'rejected'],
            defaultValue: 'pending'
        },
        partReleaseStatus:{
            type: DataTypes.ENUM,
            field: 'part_release_status',
            values: ['pending', 'released'],
            defaultValue: 'pending'
        },
        documents:{
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'documents'
        },
        isLoanCreated:{
            type: DataTypes.BOOLEAN,
            field: 'is_loan_created',
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
        isActive:{
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        },
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'loan_part_release',
    });


    PartRelease.associate = function(models) {
        PartRelease.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });
        PartRelease.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        PartRelease.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return PartRelease;
}