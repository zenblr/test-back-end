module.exports = (sequelize, DataTypes) => {
    const Store = sequelize.define('store', {
        storeUniqueId: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'store_unique_id',
            unique: true
        },
        merchantId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'merchant_id'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'created_by'
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'updated_by'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            field: 'is_active'
        }
    }, {
        freezeTableName: true,
        tableName: 'emi_store'
    });

    Store.associate = function (models) {
        Store.belongsTo(models.user, { foreignKey: 'createdBy', as: 'createdByUser' });
        Store.belongsTo(models.user, { foreignKey: 'updatedBy', as: 'updatedByUser' });
        Store.belongsTo(models.merchant, { foreignKey: 'merchantId', as: 'merchant' });
        Store.hasMany(models.broker,{foreignKey:'storeId', as:'brokers'});
    }

    return Store;
}