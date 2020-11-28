module.exports = (sequelize, DataTypes) => {

    const DigiGoldOrderTypeMaster = sequelize.define('digiGoldOrderTypeMaster', {
        // attributes
        orderType: {
            type: DataTypes.STRING,
            field: 'order_type',
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            field: 'is_active',
            defaultValue: true,
        }
    }, {
        freezeTableName: true,
        allowNull: false,
        tableName: 'digi_gold_order_type_master',
    });

    // DigiGoldConfigDetails.associate = function(models) {
    // GlobalSetting.belongsTo(models.user, { foreignKey: 'createdBy', as: 'Createdby' });
    // }


    return DigiGoldOrderTypeMaster;
}