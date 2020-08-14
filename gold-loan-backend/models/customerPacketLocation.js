module.exports = (sequelize, DataTypes) => {
    const customerPacketLocation = sequelize.define('customerPacketLocation', {
        // attributes
        loanId: {
            type: DataTypes.INTEGER,
            field: 'loan_id',
        },
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id',
        },
        receiverCustomerId: {
            type: DataTypes.INTEGER,
            field: 'receiver_customer_id'
        },
        packetLocationId: {
            type: DataTypes.INTEGER,
            field: 'packet_location_id'
        },
        emitterId: {
            type: DataTypes.INTEGER,
            field: 'packet_emitter_id'
        },
        receiverUserId: {
            type: DataTypes.INTEGER,
            field: 'receiver_user_id'
        },
        isSelected:{
            type: DataTypes.ENUM,
            field: 'is_selected',
            values:['Customer','InternalUser','PartnerUser']
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_packet_location',
    });

    // CUSTOMER PACKET LOCATION ASSOCIATION WITH MODULES
    customerPacketLocation.associate = function (models) {
        customerPacketLocation.belongsTo(models.packetLocation,{ foreignKey: 'packetLocationId',as:'packetLocation'})
    }
    return customerPacketLocation;
}
