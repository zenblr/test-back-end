module.exports = (sequelize, DataTypes) => {
    const PacketOrnament = sequelize.define('packetOrnament', {
        packetId: {
            type: DataTypes.INTEGER,
            field: 'packet_id'
        },
        ornamentDetailId: {
            type: DataTypes.INTEGER,
            field: 'ornament_detail_id',
        }
    },
        {
            freezeTableName: true,
            tableName: 'loan_packet_ornament',
        }
    );

    PacketOrnament.associate = function (models) {
        // PacketOrnament.belongsTo(models.packet, { foreignKey: 'packetId', as: 'packet' });

        // PacketOrnament.belongsTo(models.customerLoanOrnamentsDetail, { foreignKey: 'ornamentDetailId', as: 'ornamentDetail' });
    }

    return PacketOrnament;
}