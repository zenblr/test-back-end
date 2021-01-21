module.exports = (sequelize, DataTypes) => {
    const customerAugmontCity = sequelize.define('customerAugmontCity', {
        // attributes
        cityId: {
            type: DataTypes.INTEGER,
            field: 'city_id',
        },
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'customer_augmont_city',
        timestamps: false
    });

    return customerAugmontCity;
}