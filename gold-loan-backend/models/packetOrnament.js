module.exports = (sequelize, DataTypes) => {
    const PacketOrnament = sequelize.define('packetOrnament', {
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
            tableName: 'loan_packet_ornament',
        }
    );

    PacketOrnament.associate = function (models) {
        PacketOrnament.belongsTo(models.ornamentType, { foreignKey: 'ornamentTypeId', as: 'ornamentType' });
    }

    return PacketOrnament;
}