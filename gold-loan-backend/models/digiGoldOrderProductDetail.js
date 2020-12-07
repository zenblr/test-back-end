module.exports = (sequelize, DataTypes) => {

    const DigiGoldOrderProductDetail = sequelize.define('digiGoldOrderProductDetail', {
        // attributes
        orderDetailId: {
            type: DataTypes.INTEGER,
            field: 'order_detail_id',
        },
        productSku: {
            type: DataTypes.STRING,
            field: 'product_sku',
        },
        productWeight: {
            type: DataTypes.STRING,
            field: 'product_weight',
        },
        productName: {
            type: DataTypes.STRING,
            field: 'product_Name',
        },
        amount: {
            type: DataTypes.FLOAT,
            field: 'amount',
        },
        productImage: {
            type: DataTypes.STRING,
            field: 'product_Image',
        },
        totalAmount: {
            type: DataTypes.STRING,
            field: 'total_amount',
        },
        metalType: {
            type: DataTypes.STRING,
            field: 'metal_type',
        },
        quantity: {
            type: DataTypes.INTEGER,
            field: 'quantity'
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
        allowNull: false,
        tableName: 'digi_gold_order_product_Detail',
    });

    // DigiGoldConfigDetails.associate = function(models) {
    // GlobalSetting.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });

    // }


    return DigiGoldOrderProductDetail;
}