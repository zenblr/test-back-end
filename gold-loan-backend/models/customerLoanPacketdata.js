module.exports = (sequelize, DataTypes) => {
    const CustomerLoanPacketData = sequelize.define('customerLoanPacketData', {
        //attribute
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id'
        },
        packetLocationId: {
            type: DataTypes.INTEGER,
            field: 'packet_location_id'
        },
        status: {
            type: DataTypes.ENUM,
            values: ['transit', 'incomplete', 'complete'],
            field: 'status'
        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'customer_loan_packet_data',
        },
    )

    CustomerLoanPacketData.associate = function (models) {
        CustomerLoanPacketData.belongsTo(models.customerLoanMaster, { foreignKey: 'masterLoanId', as: 'masterLoan' });
        CustomerLoanPacketData.belongsTo(models.packetLocation, { foreignKey: 'packetLocationId', as: 'packetLocation' });

    }

    return CustomerLoanPacketData;

}