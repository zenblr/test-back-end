module.exports=(sequelize,DATATYPES)=>{
    const Partner=sequelize.define('partner',{
        name:{
            type:DATATYPES.STRING,
            field:'name'
        },
        commission:{
            type:DATATYPES.BIGINT,
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


    return Partner;
}