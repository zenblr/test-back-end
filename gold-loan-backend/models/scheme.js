module.exports = (sequelize, DataTypes) => {
    const Scheme = sequelize.define('scheme', {
        //attribute
        schemeName:{
            type:DataTypes.STRING,
            field:'scheme_name'
        },
        schemeAmountStart: {
            type: DataTypes.BIGINT,
            field: 'scheme_amount_start'
        },
        schemeAmountEnd: {
            type: DataTypes.BIGINT,
            field: 'scheme_amount_end'
        },
        interestRateThirtyDaysMonthly: {
            type: DataTypes.FLOAT,
            field: 'interest_rate_thirty_days_monthly'
        },
        interestRateNinetyDaysMonthly: {
            type: DataTypes.FLOAT,
            field: 'interest_rate_ninety_days_monthly'
        },
        interestRateOneHundredEightyDaysMonthly: {
            type: DataTypes.FLOAT,
            field: 'interest_rate_one_hundred_eighty_days_monthly'
        },
        processingChargeFxed: {
            type: DataTypes.FLOAT,
            field: 'processing_charge_fxed'
        },
        processingChargePercent: {
            type: DataTypes.FLOAT,
            field: 'processing_charge_percent'
        },
        maximumPercentageAllowed: {
            type: DataTypes.FLOAT,
            field: 'maximum_percentage_allowed'
        },
        penalInterest: {
            type: DataTypes.FLOAT,
            field: 'penal_interest'
        },
        default: {
            type: DataTypes.BOOLEAN,
            field: 'default',
        },
        schemeType: {
            type: DataTypes.ENUM,
            field: 'scheme_type',
            values: ['secure', 'unsecure'],
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true
        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'loan_scheme',
        },
    )
    Scheme.associate = function (models) {

        Scheme.belongsToMany(models.partner, { through: models.partnerScheme })

    }
    return Scheme;

}
