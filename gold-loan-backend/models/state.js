module.exports = (sequelize, DataTypes) => {
    const State = sequelize.define('state', {
        // attributes
        name: {
            type: DataTypes.STRING,
            field: 'name',
            allowNull: false,
        },
        stateCode: {
            type: DataTypes.STRING,
            field: 'state_code',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'state',
        timestamps: false
    });

    State.associate = function(models) {
        State.hasMany(models.city, { foreignKey: 'stateId', as: 'city' });
    }


    return State;
}