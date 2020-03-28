module.exports = (sequelize, DataTypes) => {
    const States = sequelize.define('states', {
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
        tableName: 'states',
        timestamps: false
    });

    States.associate = function(models) {
        States.hasMany(models.cities, { foreignKey: 'stateId', as: 'city' });
    }


    return States;
}