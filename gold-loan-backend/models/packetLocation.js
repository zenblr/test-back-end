module.exports = (sequelize, DataTypes) => {
    const PacketLocation = sequelize.define('packetLocation', {
        // attributes
        location: {
            type: DataTypes.TEXT,
            field: 'location',
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
        tableName: 'loan_packet_location',
    });

    PacketLocation.associate = function (models) {
        PacketLocation.hasMany(models.packetTracking, { foreignKey: 'packetLoactionId', as: 'packetTracking' })
    }

    return PacketLocation;
}