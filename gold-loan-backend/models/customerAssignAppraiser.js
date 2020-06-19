module.exports = (sequelize, DataTypes) => {
    const CustomerAssignAppraiser = sequelize.define('customerAssignAppraiser', {
        customerId: {
            type: DataTypes.INTEGER,
            field: 'customer_id',
            allowNull: false
        },
        customerUniqueId: {
            type: DataTypes.STRING,
            field: 'customer_unique_id'
        },
        appraiserId: {
            type: DataTypes.INTEGER,
            field: 'appraiser_id',
            allowNull: false
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            allowNull: false,
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        tableName: 'customer_assign_appraiser',
    });

    CustomerAssignAppraiser.associate = function (models) {
        CustomerAssignAppraiser.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
        CustomerAssignAppraiser.belongsTo(models.user, { foreignKey: 'appraiserId', as: 'appraiser' });

        CustomerAssignAppraiser.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerAssignAppraiser.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

    }

    return CustomerAssignAppraiser;
}