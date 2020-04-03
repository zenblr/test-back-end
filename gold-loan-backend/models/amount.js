module.exports=(sequelize,DATATYPES)=>{

    const amount=sequelize.define('amount',{
        startAmount:{
            type:DATATYPES.BIGINT,
            field:'start_amount'
        },
        endAmount:{
            type:DATATYPES.BIGINT,
            field:'end_amount'
        },
        isActive:{
            type:DATATYPES.BOOLEAN,
            field:'is_active'
        }
    },
    {
        freezeTableName: true,
        allowNull: false,
        tableName: 'amount',
    });
    return amount
}
