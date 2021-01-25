module.exports = (sequelize, DataTypes) => {
    const DigiGoldConfigDetails = sequelize.define('digiGoldConfigDetails', {
        // attributes
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
        modifiedBy: {
            type: DataTypes.INTEGER,
            field: 'modified_by',
            allowNull: false
        },
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'digi_gold_config_details',
    });

    DigiGoldConfigDetails.associate = function(models) {
        DigiGoldConfigDetails.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
    }

    DigiGoldConfigDetails.getConfigDetail = (configSettingName) => DigiGoldConfigDetails.findOne({ where: { configSettingName: configSettingName } });

    return DigiGoldConfigDetails;
}