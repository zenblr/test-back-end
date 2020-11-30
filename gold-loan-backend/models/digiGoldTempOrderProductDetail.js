module.exports = (sequelize, DataTypes) => {

    const DigiGoldTempOrderProductDetail = sequelize.define('digiGoldTempOrderProductDetail', {
        // attributes
        tempOrderDetailId: {
            type: DataTypes.INTEGER,
            field: 'order_detail_id',
        },
        productSku: {
            type: DataTypes.STRING,
            field: 'product_sku'
        },
        productWeight: {
            type: DataTypes.STRING,
            field: 'product_weight'
        },
        productName: {
            type: DataTypes.STRING,
            field: 'product_Name',
        },
        amount: {
            type: DataTypes.FLOAT,
            field: 'amount'
        },
        productImage: {
            type: DataTypes.STRING,
            field: 'product_Image'
        },
        totalAmount: {
            type: DataTypes.STRING,
            field: 'total_amount'
        },
        metalType: {
            type: DataTypes.STRING,
            field: 'metal_type'
        },
        quantity: {
            type: DataTypes.INTEGER,
            field: 'quantity'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'digi_gold_temp_order_product_detail',
    });

    
    DigiGoldTempOrderProductDetail.associate = function(models) {
        DigiGoldTempOrderProductDetail.belongsTo(models.digiGoldTempOrderDetail, { foreignKey: 'tempOrderDetailId', as: 'tempOrderDetail' });
    }


    return DigiGoldTempOrderProductDetail;
}