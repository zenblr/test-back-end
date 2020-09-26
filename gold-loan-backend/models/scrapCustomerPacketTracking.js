module.exports = (sequelize, DataTypes) => {
    const scrapCustomerPacketTracking = sequelize.define('scrapCustomerPacketTracking', {
        // attributes
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
        },
        packetLocationId: {
            type: DataTypes.INTEGER,
            field: 'packet_location_id'
        },
        internalBranchId: {
            type: DataTypes.INTEGER,
            field: 'internal_branch_id'
        },
        userSenderId: {
            type: DataTypes.INTEGER,
            field: 'user_sender_id'
        },
        userReceiverId: {
            type: DataTypes.INTEGER,
            field: 'user_receiver_id'
        },
        packetStatus: {
            type: DataTypes.TEXT,
            field: 'packet_status'
        },
        processingTime: {
            type: DataTypes.STRING,
            field: 'processing_time',
        },
    }, {
        freezeTableName: true,
        tableName: 'scrap_customer_packet_tracking',
    });

    // CUSTOMER PACKET LOCATION ASSOCIATION WITH MODULES
    scrapCustomerPacketTracking.associate = function (models) {
        scrapCustomerPacketTracking.belongsTo(models.scrapPacketLocation, { foreignKey: 'packetLocationId', as: 'packetLocation' });
        scrapCustomerPacketTracking.belongsTo(models.customerScrap, { foreignKey: 'scrapId', as: 'customerScrap' })
        scrapCustomerPacketTracking.belongsTo(models.user, { foreignKey: 'userSenderId', as: 'senderUser' })
        scrapCustomerPacketTracking.belongsTo(models.user, { foreignKey: 'userReceiverId', as: 'receiverUser' })
        //mapping remaining hasmany in internal and partner branch
        scrapCustomerPacketTracking.belongsTo(models.internalBranch, { foreignKey: 'internalBranchId', as: 'internalBranch' })

    }
    return scrapCustomerPacketTracking;
}
