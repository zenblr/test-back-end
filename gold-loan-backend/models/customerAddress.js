module.exports = (sequelize, DataTypes) => {
    const CustomerAddress = sequelize.define('customerAddress', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        address:{
            type: DataTypes.TEXT,
            field: 'address',
            allowNull:false
        },
        landMark: {
            type: DataTypes.STRING,
            field: 'land_mark',
            allowNull: false,
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
        CustomerAddress.belongsTo(models.customers, { foreignKey: 'customerId', as: 'singleCustomer' });
        CustomerAddress.belongsTo(models.states, { foreignKey: 'stateId', as: 'state' });
        CustomerAddress.belongsTo(models.cities, { foreignKey: 'cityId', as: 'city' });
    }

    return CustomerAddress;

}