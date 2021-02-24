module.exports = (sequelize, DataTypes) => {
    const NavisionDbConfig = sequelize.define('navisionDbConfig', {
        serverUserName: {
            type: DataTypes.STRING,
            field: 'server_user_name'
        },
        serverPassword: {
            type: DataTypes.STRING,
            field: 'server_password'
        },
        serverIp: {
            type: DataTypes.STRING,
            field: 'server_ip'
        },
        serverDbName: {
            type: DataTypes.STRING,
            field: 'server_db_name'
        },
        prefix: {
            type: DataTypes.STRING,
            field: 'prefix'
        },
        moduleName: {
            tyep: DataTypes.STRING,
            field: 'module_name'
        }
    },
        {
            freezeTableName: true,
            tableName: 'emi_navision_db_config',
        })

        NavisionDbConfig.getNavisionDbConfig = () => NavisionDbConfig.findOne();

    return NavisionDbConfig;
}
