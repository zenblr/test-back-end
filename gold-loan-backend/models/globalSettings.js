module.exports = (sequelize, DataTypes) => {
    const GlobalSetting = sequelize.define('globalSetting', {
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
        partPaymentPercent:{
            type:DataTypes.FLOAT,
            field: 'part_payment_percent',
            allowNull: false,
        },
        confidencePan:{
            type:DataTypes.FLOAT,
            field: 'confidence_pan',
        },
        confidenceAadhar:{
            type:DataTypes.FLOAT,
            field: 'confidence_aadhar',
        },
        confidenceName:{
            type:DataTypes.FLOAT,
            field: 'confidence_name', 
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
        tableName: 'loan_global_setting',
    });

    GlobalSetting.associate = function(models) {
        GlobalSetting.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
        GlobalSetting.belongsTo(models.user, { foreignKey: 'modifiedBy', as: 'Modifiedby' });
    }

    GlobalSetting.getGlobalSetting = () => GlobalSetting.findOne({order:[["updatedAt", "DESC"]]});

    return GlobalSetting;
}
