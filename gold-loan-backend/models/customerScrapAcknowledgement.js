module.exports = (sequelize, DataTypes) => {
    const CustomerAcknowledgement = sequelize.define('customerAcknowledgement', {
        // attributes
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id',
            allowNull: false
        },
        processingCharges: {
            type: DataTypes.FLOAT,
            field: 'processing_charges',
        },
        standardDeduction: {
            type: DataTypes.FLOAT,
            field: 'standard_deduction'
        },
        customerConfirmationStatus: {
            type: DataTypes.ENUM,
            field: 'customer_confirmation_status',
            values: ['confirmed', 'incomplete'],
        },
        customerConfirmation: {
            type: DataTypes.ARRAY(DataTypes.TEXT),
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