module.exports = (sequelize, DataTypes) => {
    const CustomerScrapHistory = sequelize.define('customerScrapHistory', {
        // attributes
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id',
            allowNull: false,
        },
        action: {
            type: DataTypes.STRING,
            field: 'action',
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
            allowNull: false
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'scrap_customer_scrap_history',
    });


    CustomerScrapHistory.associate = function (models) {
        CustomerScrapHistory.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
        CustomerScrapHistory.belongsTo(models.customerScrap, { foreignKey: 'scrapId', as: 'loan' });

    }

    return CustomerScrapHistory;
}