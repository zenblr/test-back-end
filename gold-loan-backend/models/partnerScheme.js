module.exports=(sequelize,DATATYPES)=>{
    const PartnerSchemes=sequelize.define('partnerSchemes',{
        //attribute
        schemeId:{
           type:DATATYPES.INTEGER,
           field:'scheme_id'
        },
        partnerId:{
        type:DATATYPES.INTEGER,
        field:'partner_id'
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
            tableName: 'partner_schemes',
        },
    )

    return PartnerSchemes;
    
}