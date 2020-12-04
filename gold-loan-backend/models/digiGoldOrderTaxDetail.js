module.exports = (sequelize, DataTypes) => {

    const DigiGoldOrderTaxDetail = sequelize.define('digiGoldOrderTaxDetail', {
        // attributes
        orderDetailId: {
            type: DataTypes.INTEGER,
            field: 'order_detail_id',
        },
        totalTaxAmount: {
            type: DataTypes.FLOAT,
            field: 'total_tax_amount',
        },
        cgst: {
            type: DataTypes.FLOAT,
            field: 'cgst',
        },
        sgst: {
            type: DataTypes.FLOAT,
            field: 'sgst',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },
    }, {
        freezeTableName: true,
        tableName: 'digi_gold_order_tax_detail',
    });

    DigiGoldOrderTaxDetail.associate = function(models) {
        DigiGoldOrderTaxDetail.belongsTo(models.digiGoldOrderDetail, { foreignKey: 'orderDetailId', as: 'orderDetail' });
    }

    return DigiGoldOrderTaxDetail;
}