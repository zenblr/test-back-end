module.exports=(sequelize,DataTypes)=>{
    const SmsAlert=sequelize.define('smsAlert',{
        event:{
            type:DataTypes.TEXT,
            field:'event'
        },
        content:{
            type:DataTypes.TEXT,
            field:'content'
        },
        isActive:{
            type:DataTypes.BOOLEAN,
            field:'is_active',
            defaultValue:true
        }
    
    },
    { freezeTableName: true,
            allowNull: false,
            tableName: 'sms_alert',
            timestamps: false})
            return SmsAlert;
    }