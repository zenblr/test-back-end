module.exports = (sequelize, DataTypes) => {
    const CustomerScrapPacket = sequelize.define('customerScrapPacket', {
        //attribute
        customerScrapPackageDetailId: {
            type: DataTypes.INTEGER,
            field: 'customer_scrap_package_detail_id'
        },
        packetId: {
            type: DataTypes.INTEGER,
            field: 'packetId'
        }
    },
        {
            freezeTableName: true, 
            allowNull: false,   
            tableName: 'scrap_customer_scrap_packet',
        },
    )

    CustomerScrapPacket.associate = function (models) {

    }

    return CustomerScrapPacket;

}