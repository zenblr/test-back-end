module.exports = (sequelize, DataTypes) => {
    const ScrapPacketLocation = sequelize.define('scrapPacketLocation', {
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
        tableName: 'scrap_packet_location',
    });

    ScrapPacketLocation.associate = function (models) {
        ScrapPacketLocation.hasMany(models.scrapPacketTracking, { foreignKey: 'packetLoactionId', as: 'scrapPacketTracking' })
    }

    return ScrapPacketLocation;
}