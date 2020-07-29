module.exports = (sequelize, DataTypes) => {
    const ScrapGlobalSetting = sequelize.define('scrapGlobalSetting', {
        // attributes
        ltvGoldValue: {
            type: DataTypes.STRING,
            field: 'ltv_gold_value',
            allowNull: false,
        },
        cashTransactionLimit: {
            type: DataTypes.STRING,
            field: 'cash_transaction_limit',
            allowNull: false,
        },
        processingChargesFixed: {
            type: DataTypes.STRING,
            field: 'processing_charges_fixed',
            allowNull: false,
        },
        processingChargesInPercent: {
            type: DataTypes.STRING,
            field: 'processing_charges_in_percent',
            allowNull: false,
        },
        gst: {
            type: DataTypes.STRING,
            field: 'gst',
            allowNull: false,
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            allowNull: false
        },
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
            allowNull: false
        },
        modifiedTime: {
            type: DataTypes.DATE,
            field: 'modified_time',
            allowNull: false
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'scrap_global_setting',
    });

    ScrapGlobalSetting.associate = function(models) {
        ScrapGlobalSetting.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        ScrapGlobalSetting.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    // ScrapGlobalSetting.getGlobalSetting = () => GlobalSetting.findOne({order:[["updatedAt", "DESC"]]});

    return ScrapGlobalSetting;
}
