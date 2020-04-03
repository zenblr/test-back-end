module.exports=(sequelize,DATATYPES)=>{
    const Schemes=sequelize.define('schemes',{
        //attribute
       amountId:{
           type:DATATYPES.INTEGER,
           field:'amount_id'
       },
        rateOfInterestThirtyDaysM:{
            type:DATATYPES.FLOAT,
            field:'rate_of_interest_thirty_days_M'
        },
        rateOfInterestSixtyDaysM:{
            type:DATATYPES.FLOAT,
            field:'rate_of_interest_sixty_days_M'
        },
        rateOfInterestNinetyDaysM:{
            type:DATATYPES.FLOAT,
            field:'rate_of_interest_ninety_days_M'
        },
        rateOfInterestThirtyDaysAn:{
            type:DATATYPES.FLOAT,
            field:'rate_of_interest_thirty_days_An'
        },
        rateOfInterestSixtyDaysAn:{
            type:DATATYPES.FLOAT,
            field:'rate_of_interest_sixty_days_An'
        },
        rateOfInterestNinetyDaysAn:{
            type:DATATYPES.FLOAT,
            field:'rate_of_interest_ninety_days_An'
        },
        partnerId:{
            type:DATATYPES.INTEGER,
            field:'partner_id'
        },
        isActive:{
            type:DATATYPES.BOOLEAN,
            field:'is_active'

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