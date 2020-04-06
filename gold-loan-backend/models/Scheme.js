module.exports=(sequelize,DATATYPES)=>{
    const Schemes=sequelize.define('schemes',{
        //attribute
        schemeAmountStart:{
           type:DATATYPES.BIGINT,
           field:'scheme_amount_start'
        },
        schemeAmountEnd:{
        type:DATATYPES.BIGINT,
        field:'scheme_amount_end'
        },
        interestRateThirtyDaysMonthly:{
            type:DATATYPES.FLOAT,
            field:'interest_rate_thirty_days_monthly'
        },
        interestRateSixtyDaysMonthly:{
            type:DATATYPES.FLOAT,
            field:'nterest_rate_sixty_days_monthly'
        },
        interestRateNinetyDaysMonthly:{
            type:DATATYPES.FLOAT,
            field:'nterest_rate_ninety_days_monthly'
        },
        interestRateThirtyDaysAnnually:{
            type:DATATYPES.FLOAT,
            field:'interest_rate_thirty_days_annually'
        },
        interestRateSixtyDaysAnnually:{
            type:DATATYPES.FLOAT,
            field:'interest_rate_sixty_days_annually'
        },
        interestRateNinetyDaysAnnually:{
            type:DATATYPES.FLOAT,
            field:'interest_rate_ninety_days_annually'
        },
        isActive:{
            type:DATATYPES.BOOLEAN,
            field:'is_active',
            defaultValue:true

        }
    },
        {
            freezeTableName: true,
            allowNull: false,
            tableName: 'schemes',
        },
    )
    return Schemes;
    
}