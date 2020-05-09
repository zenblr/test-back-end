module.exports = (sequelize, DataTypes) => {
    const packet = sequelize.define('packet', {
        // attributes
        loanUniqueId: {
            type: DataTypes.STRING,
            field: 'loan_unique_id',
            allowNull: false
        },
        customerUniqueId: {
            type: DataTypes.STRING,
            field: 'customer_unique_id'
        },
        packetId: {
            type: DataTypes.STRING,
            field: 'packet_id'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: false
        }
    }, {
        freezeTableName: true,
        tableName: 'loan_packet',
    });

    // FUNCTION TO ADD PACKET
    packet.addPacket =
        (loanUniqueId, customerUniqueId, packetId, createdBy, modifiedBy) => packet.create({
            loanUniqueId, customerUniqueId, packetId, createdBy, modifiedBy, isActive: true
        });

    // FUNCTION TO UPDATE PACKET
    packet.updatePacket =
        (id, packetId, modifiedBy) => packet.update({ packetId, modifiedBy }, { where: { id, isActive: true } });

    // FUNCTION TO REMOVE PACKET
    packet.removePacket =
        (id, modifiedBy) => packet.update({ isActive: false, modifiedBy }, { where: { id, isActive: true } });

    return packet;
}