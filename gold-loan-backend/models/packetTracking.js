module.exports = (sequelize, DataTypes) => {
    const PacketTracking = sequelize.define('packetTracking', {
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id'
        }, 
        customerLoanId: {
            type: DataTypes.INTEGER,
            field: 'customer_loan_id'
        },
        userId: {
            type: DataTypes.INTEGER,
            field: 'user_id'
        },
        packetId:{
            type:DataTypes.INTEGER,
            field:'packet_id'
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
            type:DataTypes.STRING,
            field:'battery'
        },
        network:{
            type:DataTypes.STRING,
            field:'network'
        },
        address:{
            type:DataTypes.STRING,
            field:'address'
        },
        distance:{
            type:DataTypes.FLOAT,
            field:'distance'
        },
        totalDistance:{
            type:DataTypes.FLOAT,
            field:'total_distance'
        },
        trackingDate:{
            type:DataTypes.DATEONLY,
            field:'tracking_date'
        },
        trackingTime:{
            type:DataTypes.TIME,
            field:'tracking_time'
        },
        isActive:{
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }

    },
        {
            freezeTableName: true,
            tableName: 'loan_packet_tracking',
        }
    );

    PacketTracking.associate = function (models) {
        PacketTracking.belongsTo(models.packet, { foreignKey: 'packetId', as: 'packet' });
        PacketTracking.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
        PacketTracking.belongsTo(models.customerLoan, { foreignKey: 'customerLoanId', as: 'customerLoan' });
        PacketTracking.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });

        PacketTracking.hasMany(models.packetTrackingMasterloan,{foreignKey:'packetTrackingId',as:'packetTrackingMasterloan'})
    }

    return PacketTracking
}
