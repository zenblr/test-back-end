module.exports = (sequelize, DataTypes) => {
    const UserAddress = sequelize.define('user_address', {
        // attributes
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id'
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
        tableName: 'user_address',
    });

    UserAddress.associate = function(models) {
        UserAddress.belongsTo(models.user, { foreignKey: 'userId', as: 'singleUser' });
        UserAddress.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' });
        UserAddress.belongsTo(models.city, { foreignKey: 'cityId', as: 'city' });
    }

    return UserAddress;

}