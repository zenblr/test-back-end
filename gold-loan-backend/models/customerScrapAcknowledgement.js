module.exports = (sequelize, DataTypes) => {
    const CustomerAcknowledgement = sequelize.define('customerAcknowledgement', {
        // attributes
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id',
            allowNull: false
        },
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
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        tableName: 'scrap_customer_acknowledgement',
    });

    CustomerAcknowledgement.associate = function (models) {
        CustomerAcknowledgement.belongsTo(models.customerScrap, { foreignKey: 'scrapId', as: 'scrap' });
        CustomerAcknowledgement.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerAcknowledgement.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return CustomerAcknowledgement;
}