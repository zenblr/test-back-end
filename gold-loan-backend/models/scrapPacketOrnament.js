module.exports = (sequelize, DataTypes) => {
    const ScrapPacketOrnament = sequelize.define('scrapPacketOrnament', {
        packetId: {
            type: DataTypes.INTEGER,
            field: 'packet_id'
        },
        ornamentTypeId: {
            type: DataTypes.INTEGER,
            field: 'ornament_type_id',
        }
    },
        {
            freezeTableName: true,
            tableName: 'scrap_packet_ornament',
        }
    );

    ScrapPacketOrnament.associate = function (models) {
        ScrapPacketOrnament.belongsTo(models.scrapPacket, { foreignKey: 'packetId', as: 'packet' });

        ScrapPacketOrnament.belongsTo(models.ornamentType, { foreignKey: 'ornamentTypeId', as: 'ornamentType' });
    }

    return ScrapPacketOrnament;
}