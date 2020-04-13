module.exports=(sequelize,DataTypes)=>{
    const Partner=sequelize.define('partner',{
        partnerId:{
            type:DataTypes.STRING,
            field:'partner_id'
        },
        name:{
            type:DataTypes.STRING,
            field:'name'
        },
        commission:{
            type:DataTypes.FLOAT,
            field:'commission'
        },
    
    isActive:{
        type:DataTypes.BOOLEAN,
        field:'is_active',
        defaultValue:true,

    }
},
        {
            freezeTableName: true,
            tableName: 'partner',
        }
    );


    Partner.associate = function(models) {
     
        Partner.belongsToMany(models.schemes, {through: models.partnerSchemes})
    }


    return Partner;
}