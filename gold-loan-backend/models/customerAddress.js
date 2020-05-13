module.exports = (sequelize, DataTypes) => {
    const CustomerAddress = sequelize.define('customerAddress', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false,
        },
        address:{
            type: DataTypes.TEXT,
            field: 'address',
        },
        landMark: {
            type: DataTypes.STRING,
            field: 'land_mark',
        },
        stateId: {
            type: DataTypes.INTEGER,
            field: 'state_id',
            allowNull: false,
        },
        cityId: {
            type: DataTypes.INTEGER,
            field: 'city_id',
            allowNull: false,
        },
        postalCode: {
            type: DataTypes.INTEGER,
            field: 'postal_code'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_address',
    });

    CustomerAddress.associate = function(models) {
        CustomerAddress.belongsTo(models.customer, { foreignKey: 'customerId', as: 'singleCustomer' });
        CustomerAddress.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' });
        CustomerAddress.belongsTo(models.city, { foreignKey: 'cityId', as: 'city' });
    }

    return CustomerAddress;

}