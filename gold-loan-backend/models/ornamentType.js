module.exports = (sequelize, DataTypes) => {
    const OrnamentType = sequelize.define('ornamentType', {
        name: {
            type: DataTypes.STRING,
            field: 'name'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    },
        {
            freezeTableName: true,
            tableName: 'loan_ornament_type',
        }
    );

    OrnamentType.associate = function (models) {
        // OrnamentType.hasMany(models.packetOrnament, { foreignKey: 'ornamentTypeId', as: 'packetOrnament' });

        // OrnamentType.belongsToMany(models.packet, { through: models.packetOrnament });

    }

    return OrnamentType;
}