module.exports = (sequelize, DataTypes) => {
    const Cities = sequelize.define('cities', {
        // attributes
        name: {
            type: DataTypes.STRING,
            field: 'name',
            allowNull: false,
        },
        stateId: {
            type: DataTypes.INTEGER,
            field: 'state_id',
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
        tableName: 'cities',
        timestamps: false
    });

    Cities.associate = function(models) {
        Cities.belongsTo(models.states, { foreignKey: 'stateId', as: 'state' });
    }
    return Cities;
}