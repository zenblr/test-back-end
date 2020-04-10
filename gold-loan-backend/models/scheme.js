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
        interestRateNinetyDaysMonthly:{
            type:DATATYPES.FLOAT,
            field:'interest_rate_ninety_days_monthly'
        },
        interestRateOneHundredEightyDaysMonthly:{
            type:DATATYPES.FLOAT,
            field:'interest_rate_one_hundred_eighty_days_monthly'
        },
        interestRateThirtyDaysAnnually:{
            type:DATATYPES.FLOAT,
            field:'interest_rate_thirty_days_annually'
        },
        interestRateNinetyDaysAnnually:{
            type:DATATYPES.FLOAT,
            field:'interest_rate_ninety_days_annually'
        },
        interestRateOneHundredEightyDaysAnnually:{
            type:DATATYPES.FLOAT,
            field:'interest_rate_one_hundred_eighty_days_annually'
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
    Schemes.associate = function(models) {

        Schemes.belongsToMany(models.partner, {through: models.partnerSchemes})
  
    }
    return Schemes;
    
}
