module.exports = (sequelize, DataTypes) => {
    const Gender = sequelize.define('gender', {
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
        tableName: 'gender',
        timestamps: false
    });

  
    return Gender;
}