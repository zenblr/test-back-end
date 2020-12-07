module.exports = (sequelize, DataTypes) => {
    const DigiGoldTempOrderAddress = sequelize.define('digiGoldTempOrderAddress', {
        tempOrderDetailId: {
            type: DataTypes.INTEGER,
            field: 'temp_order_detail_id',
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
            tableName: 'digi_gold_temp_order_address',
        }
    )

    DigiGoldTempOrderAddress.associate = (models) => {
        DigiGoldTempOrderAddress.belongsTo(models.digiGoldTempOrderDetail, { foreignKey: 'tempOrderDetailId', as: 'tempOrderDetail' });
        DigiGoldTempOrderAddress.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' });
        DigiGoldTempOrderAddress.belongsTo(models.city, { foreignKey: 'cityId', as: 'city' });

    }
    
    return DigiGoldTempOrderAddress;
}