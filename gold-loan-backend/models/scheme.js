module.exports = (sequelize, DataTypes) => {
    const Scheme = sequelize.define('scheme', {
        //attribute
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
        interestRateThirtyDaysAnnually: {
            type: DataTypes.FLOAT,
            field: 'interest_rate_thirty_days_annually'
        },
        interestRateNinetyDaysAnnually: {
            type: DataTypes.FLOAT,
            field: 'interest_rate_ninety_days_annually'
        },
        interestRateOneHundredEightyDaysAnnually: {
            type: DataTypes.FLOAT,
            field: 'interest_rate_one_hundred_eighty_days_annually'
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
