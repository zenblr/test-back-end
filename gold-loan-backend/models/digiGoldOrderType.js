module.exports = (sequelize, DataTypes) => {

    const DigiGoldOrderTypeMaster = sequelize.define('digiGoldOrderType', {
        // attributes
        orderType: {
            type: DataTypes.STRING,
            field: 'order_type',
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'digi_gold_order_type',
    });

    return DigiGoldOrderTypeMaster;
}