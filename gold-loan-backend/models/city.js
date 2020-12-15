module.exports = (sequelize, DataTypes) => {
    const City = sequelize.define('city', {
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
        slug: {
            type: DataTypes.STRING,
            field: 'slug',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },
        stateUniqueCode: {
            type: DataTypes.STRING,
            field: 'state_unique_id',
        },
        cityUniqueCode: {
            type: DataTypes.STRING,
            field: 'city_unique_code',
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'city',
        timestamps: false
    });

    City.associate = function (models) {
        City.belongsTo(models.state, { foreignKey: 'stateId', as: 'state' });
    }
    return City;
}