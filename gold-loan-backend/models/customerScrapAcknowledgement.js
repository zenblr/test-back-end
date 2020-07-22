module.exports = (sequelize, DataTypes) => {
    const CustomerAcknowledgement = sequelize.define('customerAcknowledgement', {
        // attributes
        approxPurityReading: {
            type: DataTypes.FLOAT,
            field: 'approx_purity_reading',
        },
        xrfMachineReadingImage: {
            type: DataTypes.TEXT,
            field: 'xrfMachineReadingImage'
        },
        customerConfirmation: {
            type: DataTypes.TEXT,
            field: 'customer_confirmation',
        }
    }, {
        freezeTableName: true,
        tableName: 'scrap_customer_acknowledgement',
    });

    return CustomerAcknowledgement;
}