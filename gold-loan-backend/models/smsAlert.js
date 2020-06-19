module.exports=(sequelize,DataTypes)=>{
    const SmsAlert=sequelize.define('smsAlert',{
        alertFor: {
            type: DataTypes.TEXT,
            field: 'alert_for',
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            field: 'content',
            allowNull: false,
        },
        createdBy:{
            type: DataTypes.INTEGER,
            field: 'created_by',
            allowNull: false,
        },
        updatedBy:{
            type: DataTypes.INTEGER,
            field: 'updated_by',
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    },
    {
        freezeTableName: true,
        tableName: 'sms_alert'
    });
    SmsAlert.associate = function(models) {
        SmsAlert.belongsTo(models.user, { foreignKey: 'createdBy', as: 'createdByUser' });
        SmsAlert.belongsTo(models.user, { foreignKey: 'updatedBy', as: 'updatedByUser' });
    }
    return SmsAlert;
    }