module.exports = (sequelize, DataTypes) => {
    const packet = sequelize.define('packet', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
        },
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        packetUniqueId: {
            type: DataTypes.STRING,
            field: 'packet_unique_id'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        packetAssigned: {
            type: DataTypes.BOOLEAN,
            field: 'packet_assigned'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        tableName: 'loan_packet',
    });


    // PACKET ASSOCIATION WITH MODULES
    packet.associate = function (models) {
        packet.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
        packet.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
    }

    // FUNCTION TO ADD PACKET
    packet.addPacket =
        (packetUniqueId, createdBy, modifiedBy) => packet.create({
            packetUniqueId, createdBy, modifiedBy, packetAssigned: false, isActive: true
        });

    // FUNCTION TO ASSIGN PACKET
    packet.assignPacket =
        (customerId, loanId, modifiedBy, id) => packet.update({
            customerId, loanId, modifiedBy, packetAssigned: true
        }, { where: { id, isActive: true } });

    // FUNCTION TO UPDATE PACKET
    packet.updatePacket =
        (id, packetUniqueId, modifiedBy) => packet.update({ packetUniqueId, modifiedBy }, { where: { id, isActive: true, packetAssigned: false } });

    // FUNCTION TO REMOVE PACKET
    packet.removePacket =
        (id, modifiedBy) => packet.update({ isActive: false, modifiedBy }, { where: { id, isActive: true, packetAssigned: false } });

    return packet;
}