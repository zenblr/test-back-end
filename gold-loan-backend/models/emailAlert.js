module.exports=(sequelize,DataTypes)=>{
const EmailAlert=sequelize.define('emailAlert',{
    event:{
        type:DataTypes.TEXT,
        field:'event'
    },
    variable:{
        type:DataTypes.TEXT,
        field:'variable'
    },
    subjectLine:{
        type:DataTypes.TEXT,
        field:'subject_line'
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
{freezeTableName: true,
        allowNull: false,
        tableName: 'email_alert',
        timestamps: false})
        return EmailAlert;
}