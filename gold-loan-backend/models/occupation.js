module.exports = (sequelize, DataTypes) => {
    const Occupation = sequelize.define('occupation', {
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
        tableName: 'occupation', 

    });


    return Occupation;
}