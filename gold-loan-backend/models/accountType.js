module.exports = (sequelize, DataTypes) => {
    const AccountType = sequelize.define('accountType', {
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

  
    return AccountType;
}