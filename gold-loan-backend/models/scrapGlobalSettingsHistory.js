module.exports = (sequelize, DataTypes) => {
    const ScrapGlobalSettingHistory = sequelize.define('scrapGlobalSettingHistory', {
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
        standardDeductionMin: {
            type: DataTypes.STRING,
            field: 'standard_deduction_min',
        },
        standardDeductionMax: {
            type: DataTypes.STRING,
            field: 'standard_deduction_max',
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
        tableName: 'scrap_global_setting_history',
    });

    ScrapGlobalSettingHistory.associate = function(models) {
        ScrapGlobalSettingHistory.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        ScrapGlobalSettingHistory.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    return ScrapGlobalSettingHistory;
}
