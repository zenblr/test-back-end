module.exports = (sequelize, DataTypes) => {
    const DigiGoldOrderAddressDetail = sequelize.define('digiGoldOrderAddressDetail', {
        orderDetailId: {
            type: DataTypes.INTEGER,
            field: 'order_detail_id',
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
            field: 'stateId'
        },
        cityId: {
            type: DataTypes.INTEGER,
            field: 'cityId'
        },
        pinCode: {
            type: DataTypes.INTEGER,
            field: 'pinCode'
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
        DigiGoldOrderAddressDetail.belongsTo(models.stage, { foreignKey: 'stageId', as: 'stage' });
        DigiGoldOrderAddressDetail.belongsTo(models.city, { foreignKey: 'cityId', as: 'city' });

    }
    
    return DigiGoldOrderAddressDetail;
}