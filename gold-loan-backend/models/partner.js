module.exports=(sequelize,DATATYPES)=>{
    const Partner=sequelize.define('partner',{
        partnerId:{
            type:DATATYPES.STRING,
            field:'partner_id'
        },
        name:{
            type:DATATYPES.STRING,
            field:'name'
        },
        commission:{
            type:DATATYPES.FLOAT,
            field:'commission'
        },
    
    isActive:{
        type:DATATYPES.BOOLEAN,
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
     
        Partner.belongsToMany(models.schemes, {through: models.partner_schemes})
    }


    return Partner;
}