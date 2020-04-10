module.exports=(sequelize,DataTypes)=>{
    const Branch=sequelize.define('branch',{
        partnerId:{
            type:DataTypes.INTEGER,
            field:'partner_id'
        },
        branchId:{
            type:DataTypes.STRING,
            field:'branch_id'
        },
        name:{
            type:DataTypes.STRING,
            field:'name'
        },
        cityId:{
            type:DataTypes.INTEGER,
            field:'city_id'
        },
        stateId:{
            type:DataTypes.INTEGER,
            field:'state_id'
        },
        address:{
            type:DataTypes.TEXT,
            field:'address'
        },
        
        pincode:{
            type:DataTypes.INTEGER,
            field:'pincode',

        },
        commission:{
            type:DataTypes.FLOAT,
            field:'commission'
        },
    isActive:{
        type:DataTypes.BOOLEAN,
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