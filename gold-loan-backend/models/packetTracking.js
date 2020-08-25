module.exports = (sequelize, DataTypes) => {
    const PacketTracking = sequelize.define('packetTracking', {
        customerLoanId: {
            type: DataTypes.INTEGER,
            field: 'customer_loan_id'
        },
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id'
        },
        appraiserId: {
            type: DataTypes.INTEGER,
            field: 'apprasier_id'
        },
        packetId:{
            type:DataTypes.INTEGER,
            field:'packet_id'
        },
        packetLoactionId:{
            type:DataTypes.INTEGER,
            field:'packet_location_id'
        },
        latitude: {
            type: DataTypes.FLOAT,
            field: 'latitude'
        },
        longitude: {
            type: DataTypes.FLOAT,
            field: 'longitude'
        },
        
        battery:{
            type:DataTypes.FLOAT,
            field:'battery'
        },
        network:{
            type:DataTypes.STRING,
            field:'network'
        },
        totalDistance:{
            type:DataTypes.FLOAT,
            field:'total_distance'
        }

    },
        {
            freezeTableName: true,
            tableName: 'loan_packet_tracking',
        }
    );

    PacketTracking.associate = function (models) {
        PacketTracking.belongsTo(models.packet, { foreignKey: 'packetId', as: 'packet' });
        PacketTracking.belongsTo(models.packetLocation, { foreignKey: 'packetLoactionId', as: 'pocketLocation' });
        PacketTracking.belongsTo(models.user, { foreignKey: 'appraiserId', as: 'user' });
        PacketTracking.belongsTo(models.customerLoan, { foreignKey: 'customerLoanId', as: 'customerLoan' });
        PacketTracking.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });

    }

    return PacketTracking
}