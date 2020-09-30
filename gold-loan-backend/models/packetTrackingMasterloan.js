module.exports = (sequelize, DataTypes) => {
    const packetTrackingMasterloan = sequelize.define('packetTrackingMasterloan', {
        masterLoanId: {
            type: DataTypes.INTEGER,
            field: 'master_loan_id'
        },
        packetTrackingId: {
            type: DataTypes.INTEGER,
            field: 'packet_tarcking_id'
        },
    },
        {
            freezeTableName: true,
            tableName: 'loan_packet_tracking_masterloan',
        }
    );


    packetTrackingMasterloan.associate = function (models) {
        packetTrackingMasterloan.belongsTo(models.customerLoanMaster,{foreignKey:'masterLoanId',as:'masterLoan'})
        packetTrackingMasterloan.belongsTo(models.packetTracking,{foreignKey:'packetTrackingId',as:'packetTracking'})
    }


    return packetTrackingMasterloan;
}