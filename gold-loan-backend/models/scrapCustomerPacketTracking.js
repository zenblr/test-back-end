module.exports = (sequelize, DataTypes) => {
    const scrapCustomerPacketTracking = sequelize.define('scrapCustomerPacketTracking', {
        // attributes
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id',
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
        senderType: {
            type: DataTypes.STRING,
            field: 'sender_type'
        },
        receiverType: {
            type: DataTypes.ENUM,
            field: 'receiver_type',
            values: [ 'InternalUser']
        },
        userReceiverId: {
            type: DataTypes.INTEGER,
            field: 'user_receiver_id'
        },
        courier: {
            type: DataTypes.STRING,
            field: 'courier'
        },
        podNumber: {
            type: DataTypes.STRING,
            field: 'pod_number'
        },
        packetStatus: {
            type: DataTypes.TEXT,
            field: 'packet_status'
        },
        processingTime: {
            type: DataTypes.STRING,
            field: 'processing_time',
        },
        isDelivered: {
            type: DataTypes.BOOLEAN,
            field: 'is_delivered',
            defaultValue: false,
        }
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
