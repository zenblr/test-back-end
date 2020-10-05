module.exports = (sequelize, DataTypes) => {
    const customerPacketTracking = sequelize.define('customerPacketTracking', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
        },
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
        },
        packetLocationId: {
            type: DataTypes.INTEGER,
            field: 'packet_location_id'
        },
        internalBranchId: {
            type: DataTypes.INTEGER,
            field: 'internal_branch_id'
        },
        partnerBranchId: {
            type: DataTypes.INTEGER,
            field: 'partner_branch_id'
        },
        senderType: {
            type: DataTypes.STRING,
            field: 'sender_type'
        },
        userSenderId: {
            type: DataTypes.INTEGER,
            field: 'user_sender_id'
        },
        partnerSenderId: {
            type: DataTypes.INTEGER,
            field: 'partner_sender_id'
        },
        receiverType: {
            type: DataTypes.ENUM,
            field: 'receiver_type',
            values: ['Customer', 'InternalUser', 'PartnerUser']
        },
        customerReceiverId: {
            type: DataTypes.INTEGER,
            field: 'customer_receiver_id'
        },
        userReceiverId: {
            type: DataTypes.INTEGER,
            field: 'user_receiver_id'
        },
        partnerReceiverId: {
            type: DataTypes.INTEGER,
            field: 'partner_receiver_id'
        },
        packetStatus: {
            type: DataTypes.TEXT,
            field: 'packet_status'
        },
        status: {
            type: DataTypes.ENUM,
            values: ['in transit', 'incomplete', 'complete'],
            field: 'status'
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
        tableName: 'customer_packet_tracking',
    });

    // CUSTOMER PACKET LOCATION ASSOCIATION WITH MODULES
    customerPacketTracking.associate = function (models) {
        customerPacketTracking.belongsTo(models.packetLocation, { foreignKey: 'packetLocationId', as: 'packetLocation' })
        customerPacketTracking.belongsTo(models.customerLoan, { foreignKey: 'loanId', as: 'customerLoan' })
        customerPacketTracking.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' })
        customerPacketTracking.belongsTo(models.user, { foreignKey: 'userSenderId', as: 'senderUser' })
        customerPacketTracking.belongsTo(models.partnerBranchUser, { foreignKey: 'partnerSenderId', as: 'senderPartner' })
        customerPacketTracking.belongsTo(models.customer, { foreignKey: 'customerReceiverId', as: 'customer' })
        customerPacketTracking.belongsTo(models.user, { foreignKey: 'userReceiverId', as: 'receiverUser' })
        customerPacketTracking.belongsTo(models.partnerBranchUser, { foreignKey: 'partnerReceiverId', as: 'receiverPartner' })
        //mapping remaining hasmany in internal and partner branch
        customerPacketTracking.belongsTo(models.internalBranch, { foreignKey: 'internalBranchId', as: 'internalBranch' })
        customerPacketTracking.belongsTo(models.partnerBranch, { foreignKey: 'partnerBranchId', as: 'partnerBranch' })

    }
    return customerPacketTracking;
}
