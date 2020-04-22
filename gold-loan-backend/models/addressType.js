module.exports = (sequelize, DataTypes) => {
    const AddressType = sequelize.define('addressType', {
        // attributes
        name: {
            type: DataTypes.STRING,
            field: 'name',
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'address_type',
        timestamps: false
    });

  
    return AddressType;
}