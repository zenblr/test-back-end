module.exports=(sequelize,DATATYPES)=>{
    const Branch=sequelize.define('branch',{
        partnerId:{
            type:DATATYPES.INTEGER,
            field:'partner_id'
        },
        branchId:{
            type:DATATYPES.STRING,
            field:'branch_id'
        },
        name:{
            type:DATATYPES.STRING,
            field:'name'
        },
        cityId:{
            type:DATATYPES.INTEGER,
            field:'city_id'
        },
        stateId:{
            type:DATATYPES.INTEGER,
            field:'state_id'
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
            type:DATATYPES.FLOAT,
            field:'commission'
        },
    isActive:{
        type:DATATYPES.BOOLEAN,
        field:'is_active',
        defaultValue:true
    }},
   
        {
            freezeTableName: true,
            tableName: 'branch',
        }
        
    );

    Branch.associate = function(models) {
        Branch.belongsTo(models.partner, { foreignKey: 'partnerId', as: 'partner' });
        Branch.belongsTo(models.states,{foreignKey:'stateId', as :'states'});
        Branch.belongsTo(models.cities,{foreignKey:'cityId', as :'cities'});

    }
    return Branch;
}