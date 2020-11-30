module.exports = (sequelize, DataTypes) => {
    const DigiGoldOrderDeliveryDetail = sequelize.define('digiGoldOrderDeliveryDetail', {
        orderDetailId: {
            type: DataTypes.INTEGER,
            field: 'order_detail_id',
        },
        shippingCharges: {
            type: DataTypes.FLOAT,
            field: 'shipping_charges'
        },
        totalQuantity: {
            type: DataTypes.INTEGER,
            field: 'total_quantity'
        },
        totalWeight: {
            type: DataTypes.FLOAT,
            field: 'total_weight'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },
    },
        {
            freezeTableName: true,
            tableName: 'digi_gold_order_delivery_detail',
        }
    )

    DigiGoldOrderDeliveryDetail.associate = (models) => {
        DigiGoldOrderDeliveryDetail.belongsTo(models.digiGoldOrderDetail, { foreignKey: 'orderDetailId', as: 'orderDetail' });
    }
    
    return DigiGoldOrderDeliveryDetail;
}