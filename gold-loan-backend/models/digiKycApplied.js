module.exports = (sequelize, DataTypes) => {
    const DigiKycApplied = sequelize.define('digiKycApplied', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        status: {
            type: DataTypes.STRING,
            field: 'status'
        }

    },
        {
            freezeTableName: true,
            tableName: 'digi_kyc_applied',
            timestamps: false
        })
    return DigiKycApplied;
}