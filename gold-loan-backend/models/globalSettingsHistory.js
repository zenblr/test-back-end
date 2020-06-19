module.exports = (sequelize, DataTypes) => {
    const GlobalSettingHistory = sequelize.define('globalSettingHistory', {
        // attributes
        ltvGoldValue: {
            type: DataTypes.STRING,
            field: 'ltv_gold_value',
            allowNull: false,
        },
        minimumLoanAmountAllowed: {
            type: DataTypes.STRING,
            field: 'minimum_loan_amount_allowed',
            allowNull: false,
        },
        minimumTopUpAmount: {
            type: DataTypes.STRING,
            field: 'minimum_topup_amount',
            allowNull: false,
        },
        gracePeriodDays: {
            type: DataTypes.STRING,
            field: 'grace_period_days',
            allowNull: false,
        },
        cashTransactionLimit: {
            type: DataTypes.STRING,
            field: 'cash_transaction_limit',
            allowNull: false,
        },
        gst: {
            type: DataTypes.STRING,
            field: 'gst',
            allowNull: false,
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
        tableName: 'loan_global_setting_history',
    });

    GlobalSettingHistory.associate = function(models) {
        GlobalSettingHistory.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        GlobalSettingHistory.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });

    }

    return GlobalSettingHistory;
}