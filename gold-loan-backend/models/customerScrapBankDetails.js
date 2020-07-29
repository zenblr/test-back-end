module.exports = (sequelize, DataTypes) => {
    const CustomerScrapBankDetails = sequelize.define('customerScrapBankDetails', {
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id',
            allowNull: false
        },
        paymentType: {
            type: DataTypes.STRING,
            field: 'payment_type',
        },
        bankName: {
            type: DataTypes.STRING,
            field: 'bank_name',
        },
        bankBranch: {
            type: DataTypes.STRING,
            field: 'bank_branch',
        },
        acHolderName: {
            type: DataTypes.STRING,
            field: 'ac_holder_name',
        },
        acNumber: {
            type: DataTypes.STRING,
            field: 'ac_number',
        },
        ifscCode: {
            type: DataTypes.STRING,
            field: 'ifsc_code',
        },
        passbookProof: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'passbook_proof',
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        tableName: 'scrap_customer_scrap_bank_details',
    });

    CustomerScrapBankDetails.associate = function (models) {
        CustomerScrapBankDetails.belongsTo(models.customerScrap, { foreignKey: 'scrapId', as: 'scrap' });
       
        CustomerScrapBankDetails.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerScrapBankDetails.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

    }

    return CustomerScrapBankDetails;
}