module.exports = (sequelize, DataTypes) => {
    const Address = sequelize.define('address', {
        // attributes
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id'
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
        tableName: 'address',
    });

    Address.associate = function(models) {
        Address.belongsTo(models.users, { foreignKey: 'userId', as: 'singleUser' });
        Address.belongsTo(models.states, { foreignKey: 'stateId', as: 'state' });
        Address.belongsTo(models.cities, { foreignKey: 'cityId', as: 'city' });
    }

    return Address;

}