module.exports = (sequelize, DataTypes) => {
    const IdentityType = sequelize.define('identityType', {
        // attributes
        name: {
            type: DataTypes.STRING,
            field: 'name',
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
        tableName: 'identity_type',
    });


    return IdentityType;
}