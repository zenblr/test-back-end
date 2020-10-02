module.exports = (sequelize, DataTypes) => {
    const CustomerScrapPacketData = sequelize.define('customerScrapPacketData', {
        //attribute
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id'
        },
        packetLocationId: {
            type: DataTypes.INTEGER,
            field: 'packet_location_id'
        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'scrap_customer_scrap_packet_data',
        },
    )

    CustomerScrapPacketData.associate = function (models) {
        CustomerScrapPacketData.belongsTo(models.customerScrap, { foreignKey: 'scrapId', as: 'customerScrap' });
        CustomerScrapPacketData.belongsTo(models.scrapPacketLocation, { foreignKey: 'packetLocationId', as: 'scrapPacketLocation' });

    }

    return CustomerScrapPacketData;

}