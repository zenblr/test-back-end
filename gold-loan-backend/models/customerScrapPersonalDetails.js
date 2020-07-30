module.exports = (sequelize, DataTypes) => {
    const CustomerScrapPersonalDetail = sequelize.define('customerScrapPersonalDetail', {
        // attributes
        scrapId: {
            type: DataTypes.INTEGER,
            field: 'scrap_id',
            allowNull: false
        },
        customerUniqueId: {
            type: DataTypes.STRING,
            field: 'customer_unique_id'
        },
        startDate: {
            type: DataTypes.DATE,
            field: 'start_date',
        },
        kycStatus:{
            type: DataTypes.STRING,
            field: 'kyc_status',
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by'
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    }, {
        freezeTableName: true,
        tableName: 'scrap_customer_scrap_personal_detail',
    });


    CustomerScrapPersonalDetail.associate = function (models) {
        CustomerScrapPersonalDetail.belongsTo(models.customerScrap, { foreignKey: 'scrapId', as: 'scrap' });

        CustomerScrapPersonalDetail.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        CustomerScrapPersonalDetail.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return CustomerScrapPersonalDetail;
}