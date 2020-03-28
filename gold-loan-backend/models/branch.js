module.exports=(sequelize,DATATYPES)=>{
    const Branch=sequelize.define('branch',{
        partnerId:{
            type:DATATYPES.INTEGER,
            field:'partner_id'
        },
        name:{
            type:DATATYPES.STRING,
            field:'name'
        },
        city:{
            type:DATATYPES.STRING,
            field:'city'
        },
        state:{
            type:DATATYPES.STRING,
            field:'state'
        },
        address:{
            type:DATATYPES.TEXT,
            field:'address'
        },
        
        pincode:{
            type:DATATYPES.INTEGER,
            field:'pincode',

        },
        commission:{
            type:DATATYPES.STRING,
            field:'commission'
        },
    isActive:{
        type:DATATYPES.BOOLEAN,
        field:'is_active'
    }},
   
        {
            freezeTableName: true,
            tableName: 'branch',
        }
        
    );

    Branch.associate = function(models) {
        Branch.belongsTo(models.partner, { foreignKey: 'partnerId', as: 'partner' });

    }
    return Branch;
}