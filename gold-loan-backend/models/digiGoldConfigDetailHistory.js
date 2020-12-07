module.exports = (sequelize, DataTypes) => {
    const DigiGoldConfigDetailsHistory = sequelize.define('digiGoldConfigDetailsHistory', {
        // attributes
        configSettingId: {
            type: DataTypes.INTEGER,
            field: 'config_setting_Id',
            allowNull: false
        },
        configSettingName: {
            type: DataTypes.STRING,
            field: 'config_setting_name',
            allowNull: false
        },
        configSettingValue: {
            type: DataTypes.INTEGER,
            field: 'config_setting_value',
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        },
        createdBy: {
            type: DataTypes.INTEGER,
            field: 'created_by',
            allowNull: false
        },
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'digi_gold_config_details_history',
    });

    DigiGoldConfigDetailsHistory.associate = function(models) {
        DigiGoldConfigDetailsHistory.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
    }

    return DigiGoldConfigDetailsHistory;
}