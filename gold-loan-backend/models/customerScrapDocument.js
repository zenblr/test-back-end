module.exports = (sequelize, DataTypes) => {
    const CustomerScrapDocument = sequelize.define('customerScrapDocument', {
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id',
            allowNull: false
        },
        purchaseVoucher: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'purchase_voucher',
        },
        purchaseInvoice: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'purchase_invoice',
        },
        saleInvoice: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
            field: 'sale_invoice',
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
        tableName: 'scrap_customer_scrap_document',
    });

    CustomerScrapDocument.associate = function (models) {
        CustomerScrapDocument.belongsTo(models.customerScrap, { foreignKey: 'scrapId', as: 'scrap' });
       
        CustomerScrapDocument.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerScrapDocument.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

    }

    return CustomerScrapDocument;
}