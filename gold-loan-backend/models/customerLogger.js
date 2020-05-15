module.exports = (sequelize, DataTypes) => {
    const CustomerLogger = sequelize.define('customerLogger', {
        // attributes
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        token: {
            type: DataTypes.TEXT
        },
        createdDate: {
            type: DataTypes.DATE
        },
        expiryDate: {
            type: DataTypes.DATE
        }
    }, {
        // options
        freezeTableName: true,
        tableName: 'customer_logger',
        timestamps: false
    });

    CustomerLogger.associate = function (models) {
        CustomerLogger.belongsTo(models.customer, { foreignKey: 'customerId', as: 'customer' });
    }

    return CustomerLogger;
}