module.exports = (sequelize, DataTypes) => {
    const CustomerLoanPacket = sequelize.define('customerLoanPacket', {
        //attribute
        customerLoanPackageDetailId: {
            type: DataTypes.INTEGER,
            field: 'customer_loan_package_detail_id'
        },
        packetId: {
            type: DataTypes.INTEGER,
            field: 'packetId'
        }
    },
        {
            freezeTableName: true,
            allowNull: false,   
            tableName: 'customer_loan_packet',
        },
    )

    CustomerLoanPacket.associate = function (models) {
        // CustomerLoanPacket.belongsTo(models.customerLoanPackageDetails, { foreignKey: 'customerLoanPackageDetailsId', as: 'customerLoanPackageDetails' });
        // CustomerLoanPacket.belongsTo(models.packet, { foreignKey: 'packetId', as: 'packet' });

    }

    return CustomerLoanPacket;

}