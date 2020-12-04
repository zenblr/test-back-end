module.exports = (sequelize, DataTypes) => {
    const ScrapPacketTracking = sequelize.define('scrapPacketTracking', {
        customerScrapId: {
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
        trackingDate:{
            type:DataTypes.DATEONLY,
            field:'tracking_date'
        },
        trackingTime:{
            type:DataTypes.TIME,
            field:'tracking_time'
        }

    },
        {
            freezeTableName: true,
            tableName: 'scrap_packet_tracking',
        }
    );

    ScrapPacketTracking.associate = function (models) {
        ScrapPacketTracking.belongsTo(models.packet, { foreignKey: 'packetId', as: 'packet' });
        ScrapPacketTracking.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
        ScrapPacketTracking.belongsTo(models.customerScrap, { foreignKey: 'customerScrapId', as: 'customerScrap' });

    }

    return ScrapPacketTracking
}
