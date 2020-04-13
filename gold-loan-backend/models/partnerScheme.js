module.exports=(sequelize,DataTypes)=>{
    const PartnerSchemes=sequelize.define('partnerSchemes',{
        //attribute
        schemeId:{
           type:DataTypes.INTEGER,
           field:'scheme_id'
        },
        partnerId:{
        type:DataTypes.INTEGER,
        field:'partner_id'
        },

        isActive:{
            type:DataTypes.BOOLEAN,
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