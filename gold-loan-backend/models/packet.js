module.exports = (sequelize, DataTypes) => {
    const packet = sequelize.define('packet', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
        },
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
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
        internalUserBranch: {
            type: DataTypes.INTEGER,
            field: 'internal_user_branch'
        },
        appraiserId: {
            type: DataTypes.INTEGER,
            field: 'appraiser_id',
        },
        barcodeNumber: {
            type: DataTypes.STRING,
            field: 'barcode_number',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        },
    }, {
        freezeTableName: true,
        tableName: 'loan_packet',
    });


    // PACKET ASSOCIATION WITH MODULES
    packet.associate = function (models) {
        packet.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' });
        packet.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });
        packet.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });

        packet.belongsTo(models.internalBranch, { foreignKey: 'internalUserBranch', as: 'internalBranch' });
        // packet.hasMany(models.packetOrnament, { foreignKey: 'packetId', as: 'packetOrnament' });

        packet.belongsTo(models.user, { foreignKey: 'appraiserId', as: 'appraiser' });


        packet.belongsToMany(models.customerLoanPackageDetails, { through: models.customerLoanPacket, foreignKey: 'packetId' });

        packet.belongsToMany(models.customerLoanOrnamentsDetail, { through: models.packetOrnament, foreignKey: 'packetId' });

        packet.hasMany(models.packetTracking, { foreignKey : 'packetId' ,as : 'packetTracking'})

    }

    // FUNCTION TO ADD PACKET
    packet.addPacket =
        (packetUniqueId, barcodeNumber, createdBy, modifiedBy, internalUserBranch) => packet.create({
            packetUniqueId, createdBy, modifiedBy, internalUserBranch, packetAssigned: false, isActive: true, barcodeNumber
        });
    // FUNCTION TO ASSIGN PACKET
    packet.assignPacket =
        (customerId, loanId, modifiedBy, id) => packet.update({
            customerId, loanId, modifiedBy, packetAssigned: true
        }, { where: { id, isActive: true } });

    // FUNCTION TO UPDATE PACKET
    packet.updatePacket =
        (id, packetUniqueId, internalUserBranch, modifiedBy, appraiserId, barcodeNumber) => packet.update({ packetUniqueId, internalUserBranch, modifiedBy, appraiserId, barcodeNumber }, { where: { id, isActive: true, packetAssigned: false } });

    // FUNCTION TO REMOVE PACKET
    packet.removePacket =
        (id, modifiedBy) => packet.update({ isActive: false, modifiedBy }, { where: { id, isActive: true, packetAssigned: false } });

    return packet;
}