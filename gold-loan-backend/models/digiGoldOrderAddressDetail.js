module.exports = (sequelize, DataTypes) => {
    const DigiGoldOrderAddressDetail = sequelize.define('digiGoldOrderAddressDetail', {
        orderDetailId: {
            type: DataTypes.INTEGER,
            field: 'order_detail_id',
        },
        customerName: {
            type: DataTypes.STRING,
            field: 'customer_name'
        },
        addressType: {
            type: DataTypes.STRING,
            field: 'address_type'
        },
        address: {
            type: DataTypes.TEXT,
            field: 'address'
        },
        stateId: {
            type: DataTypes.INTEGER,
            field: 'state_id'
        },
        cityId: {
            type: DataTypes.INTEGER,
            field: 'city_id'
        },
        pinCode: {
            type: DataTypes.INTEGER,
            field: 'pin_code'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },
    },
        {
            freezeTableName: true,
            tableName: 'digi_gold_order_address_detail',
        }
    )

    DigiGoldOrderAddressDetail.associate = (models) => {
        DigiGoldOrderAddressDetail.belongsTo(models.digiGoldOrderDetail, { foreignKey: 'orderDetailId', as: 'orderDetail' });
        DigiGoldOrderAddressDetail.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' });
        DigiGoldOrderAddressDetail.belongsTo(models.city, { foreignKey: 'cityId', as: 'city' });

    }
    
    return DigiGoldOrderAddressDetail;
}