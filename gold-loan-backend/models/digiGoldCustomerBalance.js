module.exports = (sequelize, DataTypes) => {
    const DigiGoldCustomerBalance = sequelize.define('digiGoldCustomerBalance', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
        },
        currentGoldBalance: {
            type: DataTypes.FLOAT,
            field: 'current_gold_balance',
        },
        currentSilverBalance: {
            type: DataTypes.FLOAT,
            field: 'current_silver_balance',
        },
        sellableGoldBalance: {
            type: DataTypes.FLOAT,
            field: 'sellable_gold_balance',
        },
        sellableSilverBalance: {
            type: DataTypes.FLOAT,
            field: 'sellable_silver_balance',
            defaultValue: 0,
        },
        nonSellableGoldBalance: {
            type: DataTypes.FLOAT,
            field: 'non_sellable_gold_balance',
            defaultValue: 0,
        },
        nonSellableSilverBalance: {
            type: DataTypes.FLOAT,
            field: 'non_sellable_silver_balance',
            defaultValue: 0,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },
    }, {
        freezeTableName: true,
        tableName: 'digi_gold_customer_balance',
    });

    DigiGoldCustomerBalance.associate = function(models) {
        DigiGoldCustomerBalance.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
    }

    return DigiGoldCustomerBalance;
}