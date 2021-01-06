module.exports = (sequelize, DataTypes) => {
    const DigiKycApplied = sequelize.define('digiKycApplied', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id'
        },
        status: {
            type: DataTypes.STRING,
            field: 'status'
        },
        reasonForDigiKyc: {
            type: DataTypes.TEXT,
            field: 'reason_for_digi_kyc'
        }

    },
        {
            freezeTableName: true,
            tableName: 'digi_kyc_applied',
        })

    DigiKycApplied.associate = function (models) {
        DigiKycApplied.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' })
    }
    return DigiKycApplied;
}