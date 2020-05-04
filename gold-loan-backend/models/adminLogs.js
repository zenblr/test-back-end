module.exports = (sequelize, DataTypes) => {
    const AdminLogs = sequelize.define('adminLogs', {
        userId: {
            type: DataTypes.INTEGER,
            field:'user_id'
        },
        action: {
            type: DataTypes.STRING,
            field:'action'
        }
    }, {
        freezeTableName: true,
        tableName: 'admin_logs',
       
    });

    AdminLogs.associate = function (models) {
        AdminLogs.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
    }

    AdminLogs.createAdminLog = (userId , action) =>{
        AdminLogs.create({userId , action});
    }
    return AdminLogs;
}