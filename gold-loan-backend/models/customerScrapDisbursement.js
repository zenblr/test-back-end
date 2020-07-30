module.exports = (sequelize, DataTypes) => {
    const CustomerScrapDisbursement = sequelize.define('customerScrapDisbursement', {
        // attributes
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id',
            allowNull: false
        },
        scrapAmount: {
            type: DataTypes.STRING,
            field: 'scrap_amount'
        },
        transactionId: {
            type: DataTypes.STRING,
            field: 'transaction_id'
        },
        date: {
            type: DataTypes.DATE,
            field: 'date'
        },
        paymentMode: {
            type: DataTypes.STRING,
            field: 'payment_mode'
        },
        ifscCode: {
            type: DataTypes.STRING,
            field: 'ifsc_code'
        },
        bankName: {
            type: DataTypes.STRING,
            field: 'bank_name'
        },
        bankBranch: {
            type: DataTypes.STRING,
            field: 'bank_branch'
        },
        acHolderName: {
            type: DataTypes.STRING,
            field: 'ac_holder_name'
        },
        acNumber: {
            type: DataTypes.BIGINT,
            field: 'ac_number'
        },
        disbursementStatus: {
            type: DataTypes.STRING,
            field: 'disbursement_status'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
    }, {
        freezeTableName: true,
        tableName: 'scrap_customer_scrap_disbursement',
    });

    CustomerScrapDisbursement.associate = function (models) {
        CustomerScrapDisbursement.belongsTo(models.customerScrap, { foreignKey: 'scrapId', as: 'scrap' });

        CustomerScrapDisbursement.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerScrapDisbursement.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return CustomerScrapDisbursement;
}