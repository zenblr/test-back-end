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
            field: 'is_selected',
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
    }
    return customerPacketTracking;
}
